import connectDB from '@/lib/db/connect';
import { Message, User } from '@/models';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import MessagingClient from '@/components/dashboard/MessagingClient';

export default async function AdminMessagesPage() {
  const session = await auth();
  if (!session || !session.user) redirect('/login');

  await connectDB();
  const adminId = session.user.id;

  // For Admin, we show conversations with recent therapists/patients for support
  const recentUsers = await User.find({ role: { $ne: 'ADMIN' } })
    .sort({ lastLogin: -1 })
    .limit(10)
    .lean();

  const recentMessages = await Message.find({
    $or: [{ senderId: adminId }, { receiverId: adminId }],
  })
    .sort({ createdAt: -1 })
    .lean();

  const initialConversations = recentUsers.map((user) => {
    const lastMsg = recentMessages.find(
      (m) =>
        m.senderId.toString() === user._id.toString() ||
        m.receiverId.toString() === user._id.toString()
    );

    return {
      id: user._id.toString(),
      otherUser: {
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName} (${user.role})`,
        avatar: user.avatar,
        online: false,
      },
      lastMessage: lastMsg ? lastMsg.content : 'General platform support conversation.',
      lastMessageTime: lastMsg
        ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Support',
    };
  });

  return (
    <div className="space-y-6">
      <header className="px-2">
        <h1 className="text-foreground text-3xl font-black tracking-tighter uppercase italic">
          Platform Support messages
        </h1>
        <p className="text-muted-foreground font-medium">
          Global communication hub for managing user inquiries and platform-wide
          broadcasts.
        </p>
      </header>

      <MessagingClient
        currentUser={{ id: session.user.id, name: 'System Admin' }}
        initialConversations={initialConversations}
      />
    </div>
  );
}
