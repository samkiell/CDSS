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

/**
 * SYMPTOM DATA ITEM SCHEMA
 * =========================
 * Stores individual question/answer pairs with full traceability.
 *
 * TRACEABILITY FIELDS:
 * - questionId: Unique identifier linking back to JSON rules
 * - question: Original question text (verbatim)
 * - response: Patient's answer
 * - questionCategory: Classification (location, temporal, red_flag, etc.)
 * - conditionContext: Which condition this question relates to
 * - effects: Rule-out/confirmation effects triggered by this answer
 * - timestamp: When the answer was recorded
 */
const SymptomDataSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    questionCategory: {
      type: String,
      default: 'general',
    },
    conditionContext: {
      type: String,
      default: null,
    },
    effects: {
      rule_out: [String],
      increase_likelihood: [String],
      decrease_likelihood: [String],
      red_flag: Boolean,
      red_flag_text: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * CONDITION ANALYSIS SCHEMA
 * ==========================
 * Stores the engine's analysis of each potential condition.
 * Used for traceability and therapist review.
 */
const ConditionAnalysisSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    likelihood: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    ruleOutReasons: [
      {
        question: String,
        answer: String,
      },
    ],
    confirmationReasons: [
      {
        question: String,
        answer: String,
      },
    ],
  },
  { _id: false }
);

/**
 * RED FLAG SCHEMA
 * ================
 * Stores detected red flags for urgent clinical review.
 */
const RedFlagSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    redFlagText: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * ASSESSMENT TRACE SCHEMA
 * ========================
 * Full traceability record for therapist review.
 *
 * TASK 6 IMPLEMENTATION:
 * Stores the following per assessment:
 * - Biodata snapshot
 * - Selected region
 * - Full question and answer log
 * - Rule-out decisions
 * - AI temporal diagnosis output
 * - Timestamped events
 */
const AssessmentTraceSchema = new mongoose.Schema(
  {
    region: String,
    startedAt: Date,
    completedAt: Date,
    totalQuestions: Number,
    questionsAnswered: [SymptomDataSchema],
    conditionAnalysis: [ConditionAnalysisSchema],
    redFlags: [RedFlagSchema],
    primarySuspicion: ConditionAnalysisSchema,
    differentialDiagnoses: [ConditionAnalysisSchema],
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
    /**
     * SYMPTOM DATA
     * =============
     * Full question and answer log with traceability.
     * Each entry includes effects (rule-out/confirmation) for audit.
     */
    symptomData: {
      type: [SymptomDataSchema],
      required: true,
    },
    mediaUrls: {
      type: [String], // Cloudinary URLs
      default: [],
    },
    /**
     * AI TEMPORAL DIAGNOSIS
     * ======================
     * The AI-generated preliminary diagnosis.
     *
     * IMPORTANT:
     * - This is a TEMPORAL diagnosis, not a final diagnosis
     * - The AI reasons over structured answers, not ML prediction
     * - Always includes disclaimer about preliminary nature
     * - Therapist review is required before finalization
     */
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
      differentialDiagnoses: {
        type: [String],
        default: [],
      },
      isProvisional: {
        type: Boolean,
        default: true,
        required: true,
      },
      disclaimer: {
        type: String,
        default:
          'This is a preliminary assessment and not a final diagnosis. Please consult with a healthcare professional.',
      },
    },
    /**
     * PATIENT-FACING ANALYSIS
     * ========================
     * Simplified version for patient dashboard display.
     */
    patientFacingAnalysis: {
      temporalDiagnosis: String,
      confidenceScore: Number,
      riskLevel: String,
      reasoning: [String],
    },
    /**
     * ASSESSMENT TRACE
     * =================
     * Full traceability record including:
     * - All questions and answers
     * - Condition likelihood analysis
     * - Rule-out decisions
     * - Red flags
     * - Timestamps
     */
    assessmentTrace: {
      type: AssessmentTraceSchema,
      default: null,
    },
    /**
     * STATUS WORKFLOW
     * ================
     * pending_review -> submitted_to_therapist -> assigned -> completed -> archived
     *
     * submitted_to_therapist: Locks patient answers from editing
     */
    status: {
      type: String,
      enum: [
        'pending_review',
        'submitted_to_therapist',
        'assigned',
        'completed',
        'archived',
      ],
      default: 'pending_review',
      required: true,
      index: true,
    },
    /**
     * HANDOFF TIMESTAMP
     * ==================
     * When the assessment was submitted to therapist.
     * After this, patient cannot edit their answers.
     */
    submittedToTherapistAt: {
      type: Date,
      default: null,
    },
    assessmentType: {
      type: String,
      default: 'MSK_BRANCHING_ENGINE_V1',
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
      /**
       * TODO: THERAPIST-GUIDED TESTING
       * ===============================
       * This is where therapist-guided physical testing results will be stored.
       * Implementation pending therapist-side logic.
       */
      physicalTestResults: [
        {
          testName: String,
          result: String,
          notes: String,
          performedAt: Date,
        },
      ],
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
