import connectDB from '@/lib/db/connect';
import { DiagnosisSession, Message, User } from '@/models';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import MessagingClient from '@/components/dashboard/MessagingClient';

export default async function PatientMessagesPage() {
  const session = await auth();
  if (!session || !session.user) redirect('/login');

  await connectDB();
  const patientId = session.user.id;

  // 1. Get all assigned clinicians via sessions
  const sessions = await DiagnosisSession.find({ patientId })
    .populate('clinicianId', 'firstName lastName avatar specialization')
    .sort({ updatedAt: -1 })
    .lean();

  // 2. Get recent messages
  const recentMessages = await Message.find({
    $or: [{ senderId: patientId }, { receiverId: patientId }],
  })
    .sort({ createdAt: -1 })
    .lean();

  // 3. Construct conversations
  const conversationsMap = new Map();

  sessions.forEach((sess) => {
    if (!sess.clinicianId) return;
    const cId = sess.clinicianId._id.toString();

    const lastMsg = recentMessages.find(
      (m) => m.senderId.toString() === cId || m.receiverId.toString() === cId
    );

    conversationsMap.set(cId, {
      id: cId,
      otherUser: {
        id: cId,
        name: `Dr. ${sess.clinicianId.firstName} ${sess.clinicianId.lastName}`,
        avatar: sess.clinicianId.avatar,
        online: true,
      },
      lastMessage: lastMsg
        ? lastMsg.content
        : 'Start a conversation with your therapist.',
      lastMessageTime: lastMsg
        ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'New',
    });
  });

  const initialConversations = Array.from(conversationsMap.values());

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="text-foreground text-3xl font-black tracking-tighter uppercase italic">
          Messages
        </h1>
        <p className="text-muted-foreground font-medium">
          Direct secure clinical communication with your medical team.
        </p>
      </header>

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
