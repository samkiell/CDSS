import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    targetRole: {
      type: String,
      enum: ['PATIENT', 'CLINICIAN', 'ADMIN', 'ALL'],
      required: false,
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
      enum: [
        'SYSTEM',
        'ALERT',
        'UPDATE',
        'Assessments',
        'Appointments',
        'Treatments',
        'Messages',
      ],
      default: 'SYSTEM',
    },
    status: {
      type: String,
      enum: ['Read', 'Unread'],
      default: 'Unread',
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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
