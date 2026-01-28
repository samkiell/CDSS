import React from 'react';
import connectDB from '@/lib/db/connect';
import { Notification } from '@/models';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import NotificationsClient from '@/components/dashboard/NotificationsClient';

export default async function ClinicianNotificationsPage() {
  const session = await auth();
  if (!session || !session.user) redirect('/login');

  await connectDB();
  const userId = session.user.id;

  // Fetch targeted notifications OR broadcasts for the user's role
  const notificationsRaw = await Notification.find({
    $or: [{ userId: userId }, { targetRole: { $in: [session.user.role, 'ALL'] } }],
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  const notifications = JSON.parse(JSON.stringify(notificationsRaw)).map((n) => ({
    ...n,
    isRead: n.userId
      ? n.status === 'Read'
      : n.readBy?.some((id) => id.toString() === userId),
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="px-2">
        <h1 className="text-foreground text-3xl font-bold tracking-tight uppercase">
          Clinician Notifications
        </h1>
        <p className="text-muted-foreground font-medium">
          Manage your patient queue, case updates, and system-wide service alerts.
        </p>
      </header>

      <NotificationsClient initialNotifications={notifications} />
    </div>
  );
}
