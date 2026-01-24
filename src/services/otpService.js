import crypto from 'crypto';
import nodemailer from 'nodemailer';
import EmailOtp from '@/models/EmailOtp';
import connectDB from '@/lib/db/connect';

const OTP_EXPIRATION_MINUTES = parseInt(process.env.OTP_EXPIRATION_TIME || '5', 10);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PWD,
  },
});

/**
 * Generates a 4-digit numeric OTP string
 */
const generateOtp = () => {
  return crypto.randomInt(1000, 10000).toString();
};

/**
 * Hashes the OTP using SHA-256
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Constant-time comparison for hashes
 */
const compareHashes = (providedOtp, storedHash) => {
  const providedHash = hashOtp(providedOtp);
  const providedBuffer = Buffer.from(providedHash);
  const storedBuffer = Buffer.from(storedHash);

  if (providedBuffer.length !== storedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(providedBuffer, storedBuffer);
};

/**
 * Sends OTP email
 */
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `"CDSS Verification" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is ${otp}. It expires in ${OTP_EXPIRATION_MINUTES} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Verification Code</h2>
        <p style="font-size: 16px; color: #555;">Hello,</p>
        <p style="font-size: 16px; color: #555;">Your verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff; background: #f0f7ff; padding: 10px 20px; border-radius: 5px;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #777;">This code will expire in <strong>${OTP_EXPIRATION_MINUTES} minutes</strong>. Please do not share this code with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const otpService = {
  async sendOtp(email) {
    await connectDB();

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    // Overwrite previous unverified OTPs for the same email
    await EmailOtp.deleteMany({ email, verified: false });

    await EmailOtp.create({
      email,
      otp_hash: otpHash,
      expires_at: expiresAt,
    });

    await sendOtpEmail(email, otp);
  },

  async verifyOtp(email, otp) {
    await connectDB();

    const record = await EmailOtp.findOne({ email, verified: false }).sort({
      created_at: -1,
    });

    if (!record) {
      return { success: false, message: 'Invalid or expired OTP.' };
    }

    if (new Date() > record.expires_at) {
      return { success: false, message: 'OTP has expired.' };
    }

    const isMatch = compareHashes(otp, record.otp_hash);

    if (!isMatch) {
      return { success: false, message: 'Invalid OTP Code.' };
    }

    // Mark as verified and "used once" logic is handled by verified: true
    // Subsequent calls won't find it because we search for verified: false
    record.verified = true;
    await record.save();

    return { success: true };
  },
};
