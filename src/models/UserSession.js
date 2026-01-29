import mongoose from 'mongoose';

const UserSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    device: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      expires: '30d', // Automatically delete sessions after 30 days of inactivity
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent re-compilation of the model during hot reloads
export default mongoose.models.UserSession ||
  mongoose.model('UserSession', UserSessionSchema);
