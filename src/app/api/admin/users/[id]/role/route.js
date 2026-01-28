import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const { role } = await request.json();

    if (!role || !['PATIENT', 'CLINICIAN', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Send notification for role change
    if (role === 'CLINICIAN') {
      await Notification.create({
        userId: updatedUser._id,
        title: 'Role Upgraded',
        description:
          'Your account has been upgraded to Clinician (Therapist). You can now manage patient cases.',
        type: 'SYSTEM',
        link: '/clinician/dashboard',
      });
    } else if (role === 'PATIENT') {
      await Notification.create({
        userId: updatedUser._id,
        title: 'Account Role Updated',
        description:
          'Your account role has been set to Patient. You can continue using the platform for assessments.',
        type: 'SYSTEM',
        link: '/patient/dashboard',
      });
    }

    return NextResponse.json({
      message: 'User role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
