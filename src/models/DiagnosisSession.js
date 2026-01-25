import mongoose from 'mongoose';

const DiagnosisSessionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clinicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    bodyRegion: {
      type: String,
      required: true,
    },
    symptomData: [
      {
        question: String,
        answer: mongoose.Schema.Types.Mixed,
      },
    ],
    mediaUrls: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    aiAnalysis: {
      temporalDiagnosis: {
        type: String,
        default: 'Pending Analysis',
      },
      confidenceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      riskLevel: {
        type: String,
        enum: ['Low', 'Moderate', 'Urgent', null],
        default: null,
      },
      reasoning: [String],
      isProvisional: {
        type: Boolean,
        default: true, // Crucial: Medical disclaimer requirement
      },
      label: {
        type: String,
        default: 'Provisional AI Analysis',
      },
    },
    status: {
      type: String,
      enum: ['pending_review', 'assigned', 'completed'],
      default: 'pending_review',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
DiagnosisSessionSchema.index({ status: 1, 'aiAnalysis.riskLevel': 1, createdAt: -1 });

const DiagnosisSession =
  mongoose.models.DiagnosisSession ||
  mongoose.model('DiagnosisSession', DiagnosisSessionSchema);

export default DiagnosisSession;
