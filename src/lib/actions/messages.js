'use server';

import connectDB from '@/lib/db/connect';
import { Message, User, PatientProfile } from '@/models';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

/**
 * Get the clinician assigned to the current patient
 */
export async function getAssignedClinician() {
  const session = await auth();
  if (!session || !session.user) return null;

  await connectDB();

  const profile = await PatientProfile.findOne({ userId: session.user.id })
    .populate('assignedClinician', 'firstName lastName email avatar')
    .lean();

  if (!profile || !profile.assignedClinician) return null;

  return JSON.parse(JSON.stringify(profile.assignedClinician));
}

/**
 * Get all patients assigned to the current clinician
 */
export async function getAssignedPatients() {
  const session = await auth();
  if (!session || !session.user) return [];

  await connectDB();

  const profiles = await PatientProfile.find({ assignedClinician: session.user.id })
    .populate('userId', 'firstName lastName email avatar')
    .lean();

  return JSON.parse(JSON.stringify(profiles.map((p) => p.userId)));
}

/**
 * Get messages between two users
 */
export async function getMessages(otherUserId) {
  const session = await auth();
  if (!session || !session.user) return [];

  await connectDB();

  const conversationId = [session.user.id, otherUserId].sort().join('_');

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();

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
    { senderId, receiverId: session.user.id, isRead: false },
    { $set: { isRead: true } }
  );
}
