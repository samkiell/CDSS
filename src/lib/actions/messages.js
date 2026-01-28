'use server';

import connectDB from '@/lib/db/connect';
import { Message, User, PatientProfile, DiagnosisSession } from '@/models';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

/**
 * Get the clinician assigned to the current patient
 */
export async function getAssignedClinician() {
  const session = await auth();
  if (!session || !session.user) return null;

  await connectDB();

  // 1. Try PatientProfile (Primary assignment)
  const profile = await PatientProfile.findOne({ userId: session.user.id })
    .populate('assignedClinician', 'firstName lastName email avatar lastLogin')
    .lean();

  if (profile?.assignedClinician) {
    return JSON.parse(JSON.stringify(profile.assignedClinician));
  }

  // 2. Fallback: Try most recent DiagnosisSession with an assigned clinician
  const lastSession = await DiagnosisSession.findOne({
    patientId: session.user.id,
    clinicianId: { $ne: null },
  })

    .sort({ updatedAt: -1 })
    .populate('clinicianId', 'firstName lastName email avatar lastLogin')
    .lean();

  if (lastSession?.clinicianId) {
    return JSON.parse(JSON.stringify(lastSession.clinicianId));
  }

  return null;
}

/**
 * Get all patients assigned to the current clinician
 */
export async function getAssignedPatients() {
  const session = await auth();
  if (!session || !session.user) return [];

  await connectDB();

  const patientMap = new Map();

  // 1. Get patients from PatientProfile
  const profiles = await PatientProfile.find({ assignedClinician: session.user.id })
    .populate('userId', 'firstName lastName email avatar lastLogin')
    .lean();

  profiles.forEach((p) => {
    if (p.userId) {
      patientMap.set(p.userId._id.toString(), p.userId);
    }
  });

  // 2. Get patients from DiagnosisSessions (Fallback/Legacy support)
  const sessions = await DiagnosisSession.find({ clinicianId: session.user.id })
    .populate('patientId', 'firstName lastName email avatar lastLogin')
    .lean();

  sessions.forEach((s) => {
    if (s.patientId && !patientMap.has(s.patientId._id.toString())) {
      patientMap.set(s.patientId._id.toString(), s.patientId);
    }
  });

  return JSON.parse(JSON.stringify(Array.from(patientMap.values())));
}

/**
 * Get messages between two users
 */
export async function getMessages(otherUserId) {
  const session = await auth();
  if (!session || !session.user) return [];

  await connectDB();

  const conversationId = [session.user.id, otherUserId].sort().join('_');

  const messages = await Message.find({
    conversationId,
    deletedBy: { $ne: session.user.id },
  })
    .sort({ createdAt: 1 })
    .lean();

  return JSON.parse(JSON.stringify(messages));
}

/**
 * Send a message
 */
export async function sendMessage(receiverId, content) {
  const session = await auth();
  if (!session || !session.user) throw new Error('Unauthorized');

  await connectDB();

  const conversationId = [session.user.id, receiverId].sort().join('_');

  const newMessage = await Message.create({
    senderId: session.user.id,
    receiverId,
    content,
    conversationId,
  });

  return JSON.parse(JSON.stringify(newMessage));
}

/**
 * Mark messages as read
 */
export async function markAsRead(senderId) {
  const session = await auth();
  if (!session || !session.user) return;

  await connectDB();

  await Message.updateMany(
    {
      senderId,
      receiverId: session.user.id,
      isRead: false,
      deletedBy: { $ne: session.user.id },
    },
    { $set: { isRead: true } }
  );
}

/**
 * Clear all messages in a conversation
 */
export async function clearMessages(otherUserId) {
  const session = await auth();
  if (!session || !session.user) return { success: false };

  await connectDB();

  const conversationId = [session.user.id, otherUserId].sort().join('_');
  await Message.updateMany(
    { conversationId },
    { $addToSet: { deletedBy: session.user.id } }
  );

  return { success: true };
}

/**
 * Get all conversations for the current user with real-time status
 */
export async function getConversations() {
  const session = await auth();
  if (!session || !session.user) return [];

  await connectDB();

  // Heartbeat: Update current user's lastLogin
  await User.findByIdAndUpdate(session.user.id, { lastLogin: new Date() });

  const role = session.user.role;
  let users = [];

  // 1. Identify users to chat with
  if (role === 'CLINICIAN') {
    users = await getAssignedPatients();
  } else {
    const clinician = await getAssignedClinician();
    if (clinician) users = [clinician];
  }

  // 2. Build conversation objects
  const conversations = await Promise.all(
    users.map(async (u) => {
      const conversationId = [session.user.id, u._id].sort().join('_');

      const lastMsg = await Message.findOne({
        conversationId,
        deletedBy: { $ne: session.user.id },
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        conversationId,
        receiverId: session.user.id,
        isRead: false,
      });

      // Helper to format time relative
      const formatTime = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
      };

      // Online logic: Active in last 5 mins
      const isOnline =
        u.lastLogin && Date.now() - new Date(u.lastLogin).getTime() < 5 * 60 * 1000;

      return {
        id: conversationId, // Use conversationId or User ID as key? MessagingClient uses activeTab.id to compare.
        // Note: MessagingClient uses `activeTab.otherUser.id` for fetch.
        // But `activeTab` itself has an ID.
        // Let's use conversationId as the ID for the conversation object
        // But wait, MessagingClient logic might expect `id` to be something else?
        // Let's stick to generating a unique ID. Using User ID might be safer if that's what initialConversations did.
        // Line 25 in MessagingClient: `c.id === activeTab.id`.
        // I'll use conversationId.

        otherUser: {
          id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          avatar: u.avatar || '',
          online: isOnline,
          lastLogin: u.lastLogin,
        },
        lastMessage: lastMsg ? lastMsg.content : 'No messages yet',
        lastMessageTime: lastMsg ? formatTime(lastMsg.createdAt) : '',
        unreadCount,
      };
    })
  );

  // Sort by last message time (most recent first)
  // We need to parse the time back or sort by raw date if available
  // Simple sort: put those with lastMessage first?
  // Let's just return as is, usually calling function sorts.
  return JSON.parse(JSON.stringify(conversations));
}
