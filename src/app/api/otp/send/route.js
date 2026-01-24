import { NextResponse } from 'next/server';
import { otpService } from '@/services/otpService';

// Basic in-memory rate limiting (for single-instance deployment/dev)
const rateLimitMap = new Map();

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Rate limiting: 1 request per 60 seconds per email
    const now = Date.now();
    const lastRequest = rateLimitMap.get(email);
    if (lastRequest && now - lastRequest < 60000) {
      return NextResponse.json(
        { error: 'Please wait before requesting another OTP.' },
        { status: 429 }
      );
    }
    rateLimitMap.set(email, now);

    // We don't check if user exists here to avoid email enumeration
    // Just send the OTP. If the user doesn't exist, they'll just get an OTP and that's it.
    await otpService.sendOtp(email);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP Send Error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
