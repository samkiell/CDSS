import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Assessments', 'Appointments', 'Treatments', 'Messages', 'System'],
      default: 'System',
    },
    status: {
      type: String,
      enum: ['Read', 'Unread'],
      default: 'Unread',
    },
    link: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const Notification =
  mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;
