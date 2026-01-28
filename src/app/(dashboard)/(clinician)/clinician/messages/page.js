import connectDB from '@/lib/db/connect';
import { DiagnosisSession, Message, User } from '@/models';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import MessagingClient from '@/components/dashboard/MessagingClient';

export default async function ClinicianMessagesPage() {
  const session = await auth();
  if (!session || !session.user) redirect('/login');

  await connectDB();
  const clinicianId = session.user.id;

  // 1. Get all assigned patients
  const assignedSessions = await DiagnosisSession.find({ clinicianId })
    .populate('patientId', 'firstName lastName avatar')
    .sort({ updatedAt: -1 })
    .lean();

  // 2. Get recent messages to determine last message/time
  const recentMessages = await Message.find({
    $or: [{ senderId: clinicianId }, { receiverId: clinicianId }],
  })
    .sort({ createdAt: -1 })
    .lean();

  // 3. Construct conversations list
  const conversationsMap = new Map();

  assignedSessions.forEach((sess) => {
    if (!sess.patientId) return;
    const pId = sess.patientId._id.toString();

    // Find last message for this patient
    const lastMsg = recentMessages.find(
      (m) => m.senderId.toString() === pId || m.receiverId.toString() === pId
    );

    conversationsMap.set(pId, {
      id: pId,
      otherUser: {
        id: pId,
        name: `${sess.patientId.firstName} ${sess.patientId.lastName}`,
        avatar: sess.patientId.avatar,
        online: true, // Mock online status
      },
      lastMessage: lastMsg
        ? lastMsg.content
        : 'No messages yet. Send a clinical inquiry.',
      lastMessageTime: lastMsg
        ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Active Now',
    });
  });

  const initialConversations = Array.from(conversationsMap.values());

  return (
    <div className="space-y-6">
      <MessagingClient
        currentUser={{
          id: session.user.id,
          name: `${session.user.firstName} ${session.user.lastName}`,
        }}
        initialConversations={initialConversations}
      />
    </div>
  );
}
