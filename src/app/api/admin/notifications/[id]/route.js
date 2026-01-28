import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import { Notification } from '@/models';

/**
 * DELETE /api/admin/notifications/[id]
 * Admin deletes a specific broadcast notification
 */
export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: notificationId } = params;

    await connectDB();

    const result = await Notification.deleteOne({
      _id: notificationId,
      userId: null, // Ensure we only delete broadcast notifications
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
