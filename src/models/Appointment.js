import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    therapistName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'Pending', 'Cancelled'],
      default: 'Scheduled',
    },
    type: {
      type: String,
      default: 'General Consultation',
    },
    location: {
      type: String,
      default: 'Virtual Session',
    },
  },
  {
    timestamps: true,
  }
);

const Appointment =
  mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

export default Appointment;
