import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import User, { ROLES } from '@/models/User';
import { notificationsSchema } from '@/lib/validations/clinician-settings';
import { NextResponse } from 'next/server';

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== ROLES.CLINICIAN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = notificationsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, inApp, events } = validation.data;

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          'notifications.email': email,
          'notifications.inApp': inApp,
          'notifications.events': events,
        },
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(JSON.parse(JSON.stringify(user.notifications)));
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
