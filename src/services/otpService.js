import crypto from 'crypto';
import dns from 'dns';
import nodemailer from 'nodemailer';
import EmailOtp from '@/models/EmailOtp';
import User from '@/models/User';
import connectDB from '@/lib/db/connect';

const OTP_EXPIRATION_MINUTES = parseInt(process.env.OTP_EXPIRATION_TIME || '5', 10);

// Max wrong guesses allowed per issued code before it is invalidated. A 4-digit
// code has 9000 possibilities; capping attempts makes brute force infeasible.
const MAX_OTP_ATTEMPTS = 5;

const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 465;

// Gmail App Passwords are shown with spaces (e.g. "abcd efgh ijkl mnop") but
// must be supplied without them.
const SMTP_PASS = (process.env.EMAIL_APP_PWD || '').replace(/\s+/g, '');

// Prefer IPv4 across the process (harmless even when we pin the IP below).
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // older Node — ignore
}

/**
 * Build a transporter that connects to Gmail's SMTP by IP.
 *
 * WHY: on some networks Node's internal c-ares resolver (dns.resolve4, which
 * nodemailer uses under the hood) fails with `EDNS queryA ETIMEOUT`, hanging
 * the request ~75s — even though the OS resolver (dns.lookup) and raw TCP work
 * fine. We resolve the host once via dns.lookup and connect to the IP, setting
 * tls.servername so the certificate still validates against smtp.gmail.com.
 * The resolved IP is cached for the process lifetime.
 */
let cachedTransporter = null;

const resolveIpv4 = (hostname) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('DNS lookup timed out')), 8000);
    dns.lookup(hostname, { family: 4 }, (err, address) => {
      clearTimeout(timer);
      if (err) reject(err);
      else resolve(address);
    });
  });

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;
  const ip = await resolveIpv4(SMTP_HOST);
  cachedTransporter = nodemailer.createTransport({
    host: ip, // connect by IP to bypass the broken in-process resolver
    port: SMTP_PORT,
    secure: true,
    tls: { servername: SMTP_HOST }, // keep cert validation against the real host
    auth: { user: process.env.EMAIL, pass: SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return cachedTransporter;
};

const generateOtp = () => {
  return crypto.randomInt(1000, 10000).toString();
};

const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

const compareHashes = (providedOtp, storedHash) => {
  const providedHash = hashOtp(providedOtp);
  const providedBuffer = Buffer.from(providedHash);
  const storedBuffer = Buffer.from(storedHash);

  if (providedBuffer.length !== storedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(providedBuffer, storedBuffer);
};

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

  const transporter = await getTransporter();
  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, otp) => {
  const mailOptions = {
    from: `"CDSS Security" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Reset your CDSS password',
    text: `Your password reset code is ${otp}. It expires in ${OTP_EXPIRATION_MINUTES} minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Password Reset</h2>
        <p style="font-size: 16px; color: #555;">Hello,</p>
        <p style="font-size: 16px; color: #555;">We received a request to reset your password. Use the code below to continue:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff; background: #f0f7ff; padding: 10px 20px; border-radius: 5px;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #777;">This code will expire in <strong>${OTP_EXPIRATION_MINUTES} minutes</strong>. Please do not share it with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request a password reset, you can safely ignore this email — your password will not change.</p>
      </div>
    `,
  };

  const transporter = await getTransporter();
  await transporter.sendMail(mailOptions);
};

export const otpService = {
  async sendOtp(email, registrationData = null) {
    await connectDB();

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    // Overwrite previous unverified OTPs
    await EmailOtp.deleteMany({ email, verified: false });

    await EmailOtp.create({
      email,
      otp_hash: otpHash,
      expires_at: expiresAt,
      registration_data: registrationData,
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
      await EmailOtp.deleteOne({ _id: record._id });
      return { success: false, message: 'OTP has expired.' };
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await EmailOtp.deleteOne({ _id: record._id });
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new code.',
      };
    }

    const isMatch = compareHashes(otp, record.otp_hash);

    if (!isMatch) {
      record.attempts += 1;
      // Invalidate the code once the limit is reached on this very attempt.
      if (record.attempts >= MAX_OTP_ATTEMPTS) {
        await EmailOtp.deleteOne({ _id: record._id });
        return {
          success: false,
          message: 'Too many incorrect attempts. Please request a new code.',
        };
      }
      await record.save();
      const left = MAX_OTP_ATTEMPTS - record.attempts;
      return {
        success: false,
        message: `Invalid OTP Code. ${left} attempt${left === 1 ? '' : 's'} remaining.`,
      };
    }

    // Mark current OTP as verified
    record.verified = true;
    await record.save();

    // If there is registration data, create the user account
    if (record.registration_data && record.registration_data.firstName) {
      const { firstName, lastName, password_hash } = record.registration_data;

      // Check if user already exists (just in case)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // Just update isVerified if they already exist
        existingUser.isVerified = true;
        await existingUser.save();
      } else {
        await User.create({
          email,
          firstName,
          lastName,
          password: password_hash,
          isVerified: true,
        });
      }
    } else {
      // Fallback: just mark existing user as verified if they exist
      await User.findOneAndUpdate({ email }, { isVerified: true });
    }

    return { success: true };
  },

  /**
   * Send a password-reset OTP. Stores an OTP record with no registration data
   * so it can never create an account on verification.
   */
  async sendPasswordResetOtp(email) {
    await connectDB();

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    // Clear any previous unverified OTPs for this email.
    await EmailOtp.deleteMany({ email, verified: false });

    await EmailOtp.create({
      email,
      otp_hash: otpHash,
      expires_at: expiresAt,
      registration_data: null,
    });

    await sendPasswordResetEmail(email, otp);
  },

  /**
   * Verify a password-reset OTP and consume it. Unlike verifyOtp(), this has NO
   * user-creation / isVerified side effects — it only confirms the code and
   * deletes the record so it cannot be reused.
   */
  async verifyPasswordResetOtp(email, otp) {
    await connectDB();

    const record = await EmailOtp.findOne({ email, verified: false }).sort({
      created_at: -1,
    });

    if (!record) {
      return { success: false, message: 'Invalid or expired code.' };
    }
    if (new Date() > record.expires_at) {
      await EmailOtp.deleteOne({ _id: record._id });
      return { success: false, message: 'This code has expired.' };
    }
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await EmailOtp.deleteOne({ _id: record._id });
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new code.',
      };
    }
    if (!compareHashes(otp, record.otp_hash)) {
      record.attempts += 1;
      if (record.attempts >= MAX_OTP_ATTEMPTS) {
        await EmailOtp.deleteOne({ _id: record._id });
        return {
          success: false,
          message: 'Too many incorrect attempts. Please request a new code.',
        };
      }
      await record.save();
      const left = MAX_OTP_ATTEMPTS - record.attempts;
      return {
        success: false,
        message: `Invalid code. ${left} attempt${left === 1 ? '' : 's'} remaining.`,
      };
    }

    // Consume the code so it cannot be replayed.
    await EmailOtp.deleteOne({ _id: record._id });
    return { success: true };
  },
};
