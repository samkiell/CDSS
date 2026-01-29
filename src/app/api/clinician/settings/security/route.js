import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import User, { ROLES } from '@/models/User';
import UserSession from '@/models/UserSession';
import { passwordChangeSchema } from '@/lib/validations/clinician-settings';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import encryptPassword from '@/lib/encryptPassword';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== ROLES.CLINICIAN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select(
      'twoFactorEnabled lastLogin createdAt'
    );

    // Fetch active sessions
    const sessions = await UserSession.find({ user: session.user.id })
      .sort({ lastActive: -1 })
      .limit(10);

    // Map to frontend format
    const activeSessions = sessions.map((s) => ({
      id: s._id.toString(),
      device: s.device || 'Unknown Device',
      lastActive: s.lastActive,
      isCurrent: session.user.sessionId === s._id.toString(),
      ip: s.ip || 'Unknown IP',
    }));

    // If no session tracked yet (legacy), we return empty or just current derived
    if (activeSessions.length === 0) {
      // Fallback? Or just empty.
      // Realistically, user just logged in so they should have one if they re-logged in.
      // But if they are using old JWT, they won't have sessionId.
    }

    return NextResponse.json({
      twoFactorEnabled: user.twoFactorEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      activeSessions,
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== ROLES.CLINICIAN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    // Handle Password Change
    if (body.currentPassword && body.newPassword) {
      const validation = passwordChangeSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid password data', details: validation.error.flatten() },
          { status: 400 }
        );
      }

      const user = await User.findById(session.user.id).select('+password');
      const isMatch = await bcrypt.compare(body.currentPassword, user.password);

      if (!isMatch) {
        return NextResponse.json(
          { error: 'Incorrect current password' },
          { status: 400 }
        );
      }

      const hashedPassword = await encryptPassword(body.newPassword);
      user.password = hashedPassword;
      await user.save();

      return NextResponse.json({ message: 'Password updated successfully' });
    }

    // Handle 2FA Toggle
    if (typeof body.twoFactorEnabled === 'boolean') {
      const user = await User.findByIdAndUpdate(
        session.user.id,
        { $set: { twoFactorEnabled: body.twoFactorEnabled } },
        { new: true }
      );
      return NextResponse.json({ twoFactorEnabled: user.twoFactorEnabled });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== ROLES.CLINICIAN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionIdToLogOut = searchParams.get('sessionId');

    await connectDB();

    if (sessionIdToLogOut) {
      // Log out specific session
      // Security check: ensure this session belongs to the user
      const result = await UserSession.deleteOne({
        _id: sessionIdToLogOut,
        user: session.user.id,
      });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Session not found or already logged out' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Session logged out' });
    } else {
      // Log out all OTHER sessions
      const query = { user: session.user.id };

      if (session.user.sessionId) {
        // Keep current session alive
        query._id = { $ne: session.user.sessionId };
      }

      await UserSession.deleteMany(query);
      return NextResponse.json({ message: 'All other sessions logged out' });
    }
  } catch (error) {
    console.error('Error logging out sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
