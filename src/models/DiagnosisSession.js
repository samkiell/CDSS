/**
 * Diagnosis Session Model
 * Captures the diagnostic journey from symptom intake to final diagnosis
 */

import mongoose from 'mongoose';

const SymptomResponseSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    questionCategory: {
      type: String,
      enum: [
        'pain_location',
        'pain_character',
        'pain_intensity',
        'duration',
        'aggravating_factors',
        'relieving_factors',
        'associated_symptoms',
        'functional_impact',
        'medical_history',
        'other',
      ],
      required: true,
    },
    responseType: {
      type: String,
      enum: ['single_choice', 'multiple_choice', 'scale', 'text', 'boolean'],
      required: true,
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    weight: {
      type: Number,
      default: 1.0, // Weight for heuristic calculation
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const DiagnosisResultSchema = new mongoose.Schema(
  {
    conditionCode: {
      type: String, // ICD-11 or internal code
      required: true,
    },
    conditionName: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number, // 0.0 - 1.0
      required: true,
      min: 0,
      max: 1,
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'unknown'],
      default: 'unknown',
    },
    matchedPatterns: [
      {
        patternId: String,
        matchScore: Number,
      },
    ],
    recommendations: [String],
  },
  { _id: false },
);

const DiagnosisSessionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Session metadata
    sessionStatus: {
      type: String,
      enum: ['in_progress', 'completed', 'reviewed', 'archived'],
      default: 'in_progress',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // Symptom responses from questionnaire
    symptoms: [SymptomResponseSchema],
    // Body region(s) affected
    affectedRegions: [
      {
        type: String,
        enum: [
          'cervical_spine',
          'thoracic_spine',
          'lumbar_spine',
          'shoulder',
          'elbow',
          'wrist_hand',
          'hip',
          'knee',
          'ankle_foot',
          'other',
        ],
      },
    ],
    // Rule-based heuristic diagnosis output
    temporalDiagnosis: {
      primaryDiagnosis: DiagnosisResultSchema,
      differentialDiagnoses: [DiagnosisResultSchema],
      calculatedAt: { type: Date, default: null },
      engineVersion: { type: String, default: '1.0.0' },
    },
    // Future ML-based diagnosis output
    finalDiagnosis: {
      primaryDiagnosis: DiagnosisResultSchema,
      differentialDiagnoses: [DiagnosisResultSchema],
      calculatedAt: { type: Date, default: null },
      modelVersion: { type: String, default: null },
      // Placeholder for Bayesian network confidence intervals
      bayesianMetrics: {
        posteriorProbability: { type: Number, default: null },
        uncertaintyRange: {
          lower: { type: Number, default: null },
          upper: { type: Number, default: null },
        },
      },
    },
    // Clinician review
    clinicianReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      reviewedAt: { type: Date, default: null },
      confirmedDiagnosis: { type: String, default: null },
      clinicianNotes: { type: String, default: null },
      treatmentPlan: { type: String, default: null },
      referralRequired: { type: Boolean, default: false },
      referralDetails: { type: String, default: null },
    },
    // Attachments (X-rays, MRIs via Cloudinary)
    attachments: [
      {
        type: {
          type: String,
          enum: ['xray', 'mri', 'ct_scan', 'ultrasound', 'photo', 'document'],
        },
        url: String, // Cloudinary URL
        publicId: String, // Cloudinary public ID
        uploadedAt: { type: Date, default: Date.now },
        description: String,
      },
    ],
    // Chat transcript (if conversational intake used)
    chatTranscript: [
      {
        role: { type: String, enum: ['system', 'patient', 'assistant'] },
        content: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes for common queries
DiagnosisSessionSchema.index({ patientId: 1, createdAt: -1 });
DiagnosisSessionSchema.index({ sessionStatus: 1 });
DiagnosisSessionSchema.index({ 'clinicianReview.reviewedBy': 1 });

const DiagnosisSession =
  mongoose.models.DiagnosisSession ||
  mongoose.model('DiagnosisSession', DiagnosisSessionSchema);

export default DiagnosisSession;
