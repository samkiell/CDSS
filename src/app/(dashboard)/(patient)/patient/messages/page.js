'use client';

import React, { useState } from 'react';
import MessagingClient from '@/components/dashboard/MessagingClient';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function MessagesPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const conversations = [
    {
      id: 1,
      otherUser: {
        id: 'dr-ajayi',
        name: 'Dr Ajayi',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=DrAjayi`,
        online: true,
      },
      lastMessage: 'How are you today David?',
      unreadCount: 12,
      lastMessageTime: 'Yesterday',
    },
    {
      id: 2,
      otherUser: {
        id: 'dr-isaac',
        name: 'Dr Isaac',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=DrIsaac`,
        online: false,
      },
      lastMessage: 'How are you today David?',
      unreadCount: 10,
      lastMessageTime: '2d ago',
    },
    {
      id: 3,
      otherUser: {
        id: 'dr-bull',
        name: 'Dr Bull',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=DrBull`,
        online: true,
      },
      lastMessage: 'How are you today David?',
      unreadCount: 21,
      lastMessageTime: '2d ago',
    },
    {
      id: 4,
      otherUser: {
        id: 'dr-olufemi',
        name: 'Dr Olufemi',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=DrOlufemi`,
        online: false,
      },
      lastMessage: 'How are you today David?',
      unreadCount: 0,
      lastMessageTime: '2d ago',
    },
    {
      id: 5,
      otherUser: {
        id: 'dr-dayo',
        name: 'Dr Dayo',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=DrDayo`,
        online: true,
      },
      lastMessage: 'How are you today David?',
      unreadCount: 0,
      lastMessageTime: '2d ago',
    },
  ];

  if (status === 'loading') {
    return (
      <div className="flex h-[60vh] items-center justify-center">Loading messages...</div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="mb-8">
        <h1 className="text-foreground text-3xl font-bold tracking-tighter uppercase">
          Messages
        </h1>
        <p className="text-muted-foreground font-medium">
          Direct secure clinical communication with your medical team.
        </p>
      </header>

      <MessagingClient
        currentUser={{
          id: session?.user?.id,
          name: `${session?.user?.firstName} ${session?.user?.lastName}`,
        }}
        initialConversations={conversations}
      />
    </div>
  );
}
