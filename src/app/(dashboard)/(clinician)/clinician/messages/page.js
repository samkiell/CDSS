'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import MessagingClient from '@/components/dashboard/MessagingClient';

const patientConversations = [
  {
    id: 1,
    otherUser: {
      id: 'patient-1',
      name: 'David Adeleke',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      online: true,
    },
    lastMessage: 'The pain in my lower back has reduced, thank you.',
    unreadCount: 2,
    lastMessageTime: '10m ago',
  },
  {
    id: 2,
    otherUser: {
      id: 'patient-2',
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      online: false,
    },
    lastMessage: 'When is our next session scheduled?',
    unreadCount: 0,
    lastMessageTime: '2h ago',
  },
  {
    id: 3,
    otherUser: {
      id: 'patient-3',
      name: 'Michael Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      online: true,
    },
    lastMessage: 'I uploaded the scan reports you requested.',
    unreadCount: 5,
    lastMessageTime: 'Yesterday',
  },
  {
    id: 4,
    otherUser: {
      id: 'patient-4',
      name: 'Aisha Bello',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
      online: false,
    },
    lastMessage: 'Is it normal to feel stiff after the exercise?',
    unreadCount: 0,
    lastMessageTime: '2d ago',
  },
  {
    id: 5,
    otherUser: {
      id: 'patient-5',
      name: 'Robert Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
      online: true,
    },
    lastMessage: 'Thank you for the prescription.',
    unreadCount: 0,
    lastMessageTime: '3d ago',
  },
];

export default function ClinicianMessagesPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  if (status === 'loading') {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        Initializing secure line...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <MessagingClient
        currentUser={{
          id: session?.user?.id,
          name: `${session?.user?.firstName} ${session?.user?.lastName}`,
        }}
        initialConversations={patientConversations}
      />
    </div>
  );
}
