import { NextResponse } from 'next/server';
import { otpService } from '@/services/otpService';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';

// Best-effort per-email throttle (in-memory; resets on redeploy).
const rateLimitMap = new Map();

/**
 * POST /api/auth/forgot-password
 * Sends a password-reset code to the email IF an account exists.
 *
 * To avoid account enumeration, the response is the SAME generic success
 * whether or not the email is registered.
 */
export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit: 1 request / 60s / email.
    const now = Date.now();
    const last = rateLimitMap.get(normalizedEmail);
    if (last && now - last < 60000) {
      return NextResponse.json(
        { error: 'Please wait a minute before requesting another code.' },
        { status: 429 }
      );
    }
    rateLimitMap.set(normalizedEmail, now);

    await connectDB();
    const user = await User.findOne({ email: normalizedEmail }).select('_id');

    // Only actually send when the user exists — but never reveal that.
    if (user) {
      await otpService.sendPasswordResetOtp(normalizedEmail);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists for that email, a reset code has been sent.',
    });
  } catch (error) {
    console.error('Forgot-password error:', error);
    return NextResponse.json(
      { error: 'Could not process the request. Please try again.' },
      { status: 500 }
    );
  }
}
