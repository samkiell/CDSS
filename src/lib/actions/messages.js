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

  const patients = Array.from(patientMap.values());

  // Attach latest session ID to each patient
  await Promise.all(
    patients.map(async (p) => {
      const latestSession = await DiagnosisSession.findOne({
        patientId: p._id,
      })
        .select('_id')
        .sort({ updatedAt: -1 })
        .lean();

      if (latestSession) {
        p.sessionId = latestSession._id.toString();
      }
    })
  );

  return JSON.parse(JSON.stringify(patients));
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
/**
 * Get all conversations for the current user with real-time status
 */
export async function getConversations() {
  const session = await auth();
  if (!session || !session.user) return [];

  await connectDB();

  // Heartbeat: Update current user's lastLogin and lastSeenAt
  await User.findByIdAndUpdate(session.user.id, {
    lastLogin: new Date(),
    lastSeenAt: new Date(),
  });

  const currentUserId = session.user.id;
  const role = session.user.role;
  const userMap = new Map();

  // 1. Get Assigned Users (Start from these)
  let assignedUsers = [];
  if (role === 'CLINICIAN' || role === 'ADMIN') {
    // Admins can potentially chat with everyone, or just behave like Clinicians for now
    // For now, let's treat Admin same as Clinician or maybe fetch ALL users?
    // Let's stick to existing logic for "Assigned" but enhance with history
    assignedUsers = await getAssignedPatients();
  } else {
    // Patients
    const clinician = await getAssignedClinician();
    if (clinician) assignedUsers = [clinician];
  }

  assignedUsers.forEach((u) => {
    if (u && u._id) userMap.set(u._id.toString(), u);
  });

  // 2. Get Users from Message History (anyone who has messaged us or we messaged)
  // Find all distinct conversationIds involving this user
  const distinctConversations = await Message.find({
    $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    deletedBy: { $ne: currentUserId },
  }).distinct('conversationId');

  // Extract other user IDs from conversationIds
  const historyUserIds = new Set();
  distinctConversations.forEach((cid) => {
    const parts = cid.split('_');
    const otherId = parts.find((id) => id !== currentUserId.toString());
    if (otherId) historyUserIds.add(otherId);
  });

  // Fetch details for these users if not already in map
  const missingUserIds = Array.from(historyUserIds).filter((id) => !userMap.has(id));

  if (missingUserIds.length > 0) {
    const historyUsers = await User.find({ _id: { $in: missingUserIds } })
      .select('firstName lastName email avatar lastLogin lastSeenAt role')
      .lean();

    historyUsers.forEach((u) => {
      userMap.set(u._id.toString(), u);
    });
  }

  const allUsers = Array.from(userMap.values());

  // 3. Build conversation objects
  const conversations = await Promise.all(
    allUsers.map(async (u) => {
      const conversationId = [currentUserId, u._id].sort().join('_');

      const lastMsg = await Message.findOne({
        conversationId,
        deletedBy: { $ne: currentUserId },
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        conversationId,
        receiverId: currentUserId,
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

      // Online logic: Active in last 2 mins (using lastSeenAt if available, else fallback to lastLogin)
      const lastActive = u.lastSeenAt || u.lastLogin;
      const isOnline =
        lastActive && Date.now() - new Date(lastActive).getTime() < 2 * 60 * 1000;

      return {
        id: conversationId,
        otherUser: {
          id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          avatar: u.avatar || '',
          online: isOnline,
          online: isOnline,
          lastLogin: u.lastLogin,
          role: u.role,
          sessionId:
            u.sessionId || // Try to use existing if available (from getAssignedPatients)
            (
              await DiagnosisSession.findOne({ patientId: u._id })
                .sort({ updatedAt: -1 })
                .select('_id')
            )?._id?.toString(),
        },
        lastMessage: lastMsg ? lastMsg.content : 'No messages yet',
        lastMessageTime: lastMsg ? formatTime(lastMsg.createdAt) : '',
        unreadCount,
        // Helper sort key
        timestamp: lastMsg ? new Date(lastMsg.createdAt).getTime() : 0,
      };
    })
  );

  // Sort by most recent message, then online status
  return JSON.parse(
    JSON.stringify(conversations.sort((a, b) => b.timestamp - a.timestamp))
  );
}
