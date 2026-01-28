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
    symptomData: {
      type: [Object], // Question + Answer pairs
      required: true,
    },
    mediaUrls: {
      type: [String], // Cloudinary URLs
      default: [],
    },
    aiAnalysis: {
      temporalDiagnosis: {
        type: String,
        required: true,
      },
      confidenceScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      riskLevel: {
        type: String,
        enum: ['Low', 'Moderate', 'Urgent'],
        required: true,
        index: true,
      },
      reasoning: {
        type: [String],
        required: true,
      },
      isProvisional: {
        type: Boolean,
        default: true,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['pending_review', 'assigned', 'completed', 'archived'],
      default: 'pending_review',
      required: true,
      index: true,
    },
    assessmentType: {
      type: String,
      default: 'MSK_HEURISTIC_V1',
    },
    clinicianReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: Date,
      confirmedDiagnosis: String,
      clinicianNotes: String,
      prescriptions: [String],
      recommendedPlan: String,
    },
    finalDiagnosis: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const DiagnosisSession =
  mongoose.models.DiagnosisSession ||
  mongoose.model('DiagnosisSession', DiagnosisSessionSchema);

export default DiagnosisSession;
