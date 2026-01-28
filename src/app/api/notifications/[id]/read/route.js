import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import { Notification } from '@/models';

/**
 * PATCH /api/notifications/[id]/read
 * Marks a notification as read for the current user
 */
export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: notificationId } = params;
    const userId = session.user.id;

    await connectDB();

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId) {
      // Individual notification
      if (notification.userId.toString() !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      notification.status = 'Read';
    } else {
      // Broadcast notification - add user to readBy array
      if (!notification.readBy.includes(userId)) {
        notification.readBy.push(userId);
      }
    }

    await notification.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
