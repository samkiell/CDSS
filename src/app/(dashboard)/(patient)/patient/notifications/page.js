import connectDB from '@/lib/db/connect';
import { Notification } from '@/models';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import NotificationsClient from '@/components/dashboard/NotificationsClient';

export default async function NotificationsPage() {
  const session = await auth();
  if (!session || !session.user) redirect('/login');

  await connectDB();
  const userId = session.user.id;

  // Fetch real notifications
  const notificationsRaw = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const notifications = JSON.parse(JSON.stringify(notificationsRaw));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="px-2">
        <h1 className="text-foreground text-3xl font-black tracking-tighter uppercase italic">
          Notifications
        </h1>
        <p className="text-muted-foreground font-medium">
          Real-time updates on your clinical assessments, treatment progress, and
          scheduled sessions.
        </p>
      </header>

      <NotificationsClient initialNotifications={notifications} />
    </div>
  );
}
