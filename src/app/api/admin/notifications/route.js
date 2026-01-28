import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import { Notification } from '@/models';

/**
 * POST /api/admin/notifications
 * Admin creates a broadcast notification
 */
export async function POST(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, type, targetRole, link } = await req.json();

    if (!title || !description || !targetRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const notification = await Notification.create({
      title,
      description,
      type,
      targetRole,
      link,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Admin notification creation failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET /api/admin/notifications
 * Admin fetches broadcast notification history
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const notifications = await Notification.find({ userId: null })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notification history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
