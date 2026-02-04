import mongoose from 'mongoose';

/**
 * BIODATA SNAPSHOT SCHEMA
 * ========================
 * Stores a snapshot of patient biodata at the time of assessment.
 *
 * WHY SNAPSHOT?
 * - Preserves historical accuracy (patient's data at time of assessment)
 * - Patient profile may change over time, but assessment records remain accurate
 * - Each assessment is self-contained for audit/legal purposes
 * - Changes to biodata during assessment do NOT update patient's main profile
 */
const BiodataSnapshotSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    sex: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    ageRange: {
      type: String,
      enum: ['15-20', '21-30', '31-40', '41-50', '51-60', '60+'],
      required: true,
    },
    occupation: {
      type: String,
      enum: ['Sedentary', 'Light manual', 'Heavy manual', 'Athlete'],
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: null,
    },
    confirmedAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

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
    /**
     * BIODATA SNAPSHOT
     * =================
     * Per-assessment snapshot of patient biodata.
     * This data is confirmed by the patient before starting the assessment.
     * It does NOT update the patient's main profile/settings.
     *
     * Required for new assessments (after this feature was added).
     * May be null for legacy assessments created before this feature.
     */
    biodata: {
      type: BiodataSnapshotSchema,
      default: null,
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
    patientFacingAnalysis: {
      temporalDiagnosis: String,
      confidenceScore: Number,
      riskLevel: String,
      reasoning: [String],
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
