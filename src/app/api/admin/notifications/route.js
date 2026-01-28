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
