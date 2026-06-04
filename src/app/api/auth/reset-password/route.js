import { NextResponse } from 'next/server';
import { otpService } from '@/services/otpService';
import encryptPassword from '@/lib/encryptPassword';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';

/**
 * POST /api/auth/reset-password
 * Body: { email, otp, newPassword }
 *
 * Verifies the reset code (single-use) and sets a new password.
 */
export async function POST(req) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }
    if (!otp || !/^\d{4}$/.test(String(otp))) {
      return NextResponse.json({ error: 'A valid 4-digit code is required' }, { status: 400 });
    }
    if (!newPassword || String(newPassword).length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify and consume the reset code first.
    const verification = await otpService.verifyPasswordResetOtp(
      normalizedEmail,
      String(otp)
    );
    if (!verification.success) {
      return NextResponse.json(
        { error: verification.message || 'Invalid or expired code.' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      // Code was valid for this email but user is gone — generic failure.
      return NextResponse.json({ error: 'Unable to reset password.' }, { status: 400 });
    }

    user.password = await encryptPassword(String(newPassword));
    // A verified reset implies a verified email.
    if (user.isVerified === false) user.isVerified = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset. You can now sign in.',
    });
  } catch (error) {
    console.error('Reset-password error:', error);
    return NextResponse.json(
      { error: 'Could not reset the password. Please try again.' },
      { status: 500 }
    );
  }
}
