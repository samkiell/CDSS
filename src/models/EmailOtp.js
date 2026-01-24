import mongoose from 'mongoose';

const EmailOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp_hash: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

// Create index for automatic cleanup of expired records
EmailOtpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
EmailOtpSchema.index({ email: 1 });

const EmailOtp = mongoose.models.EmailOtp || mongoose.model('EmailOtp', EmailOtpSchema);

export default EmailOtp;
