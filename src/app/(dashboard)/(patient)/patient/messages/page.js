import React from 'react';
import MessagingClient from '@/components/dashboard/MessagingClient';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAssignedClinician, getMessages } from '@/lib/actions/messages';
import connectDB from '@/lib/db/connect';
import { Message } from '@/models';

export default async function MessagesPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  await connectDB();

  const clinician = await getAssignedClinician();

  let initialConversations = [];

  if (clinician) {
    // Fetch last message for the conversation
    const conversationId = [session.user.id, clinician._id].sort().join('_');
    const lastMsg = await Message.findOne({ conversationId })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = await Message.countDocuments({
      conversationId,
      receiverId: session.user.id,
      isRead: false,
    });

    initialConversations = [
      {
        id: clinician._id,
        otherUser: {
          id: clinician._id,
          name: `Dr ${clinician.firstName} ${clinician.lastName}`,
          avatar:
            clinician.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${clinician.lastName}`,
          online: false, // We don't have real-time online status yet
        },
        lastMessage: lastMsg ? lastMsg.content : 'Start a conversation',
        unreadCount: unreadCount,
        lastMessageTime: lastMsg ? formatTimeAgo(lastMsg.createdAt) : '',
      },
    ];
  }

  return (
    <div className="mx-auto max-w-6xl">
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

function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}
