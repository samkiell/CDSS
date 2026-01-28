import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import { Notification } from '@/models';

/**
 * GET /api/notifications
 * Returns notifications for the logged-in user, filtered by role and specific userId
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId, role } = session.user;

    await connectDB();

    // Fetch targeted notifications OR broadcasts for the user's role
    const notifications = await Notification.find({
      $or: [{ userId: userId }, { targetRole: { $in: [role, 'ALL'] } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Map to include a clean 'isRead' property based on individual user status or readBy array
    const formattedNotifications = notifications.map((n) => {
      const isRead = n.userId
        ? n.status === 'Read'
        : n.readBy?.some((id) => id.toString() === userId);

      return {
        ...n,
        isRead,
      };
    });

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
