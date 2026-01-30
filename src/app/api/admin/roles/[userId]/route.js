import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { createAuditLog } from '@/lib/audit';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { userId } = await params;
    const { role, isActive } = await request.json();

    // Prevent self-destructive actions
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Admins cannot modify their own role or status' },
        { status: 403 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const oldData = {
      role: user.role,
      isActive: user.isActive,
    };

    const updateData = {};
    if (role !== undefined) {
      if (!['PATIENT', 'CLINICIAN', 'ADMIN'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      updateData.role = role;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    // Audit the action
    await createAuditLog(session.user.id, 'USER_ROLE_STATUS_UPDATE', userId, {
      before: oldData,
      after: updateData,
    });

    // Send notification for role change
    if (role && role !== oldData.role) {
      if (role === 'CLINICIAN') {
        await Notification.create({
          userId: updatedUser._id,
          title: 'Role Upgraded',
          description:
            'Your account has been upgraded to Clinician. You can now manage patient cases.',
          type: 'SYSTEM',
          link: '/clinician/dashboard',
        });
      } else if (role === 'PATIENT') {
        await Notification.create({
          userId: updatedUser._id,
          title: 'Account Role Updated',
          description: 'Your account role has been set to Patient.',
          type: 'SYSTEM',
          link: '/patient/dashboard',
        });
      }
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user role/status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
