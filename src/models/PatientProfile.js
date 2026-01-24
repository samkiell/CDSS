/**
 * Patient Profile Model
 * Extended profile information for patient users
 */

import mongoose from 'mongoose';

const MedicalHistorySchema = new mongoose.Schema(
  {
    condition: {
      type: String,
      required: true,
    },
    diagnosedDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'managed'],
      default: 'active',
    },
    notes: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const PatientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Physical characteristics relevant to MSK assessment
    height: {
      value: { type: Number, default: null },
      unit: { type: String, enum: ['cm', 'in'], default: 'cm' },
    },
    weight: {
      value: { type: Number, default: null },
      unit: { type: String, enum: ['kg', 'lb'], default: 'kg' },
    },
    // Occupation (relevant for MSK diagnosis)
    occupation: {
      type: String,
      default: null,
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active', null],
      default: null,
    },
    // Medical history
    medicalHistory: [MedicalHistorySchema],
    // Current medications
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, default: null },
        frequency: { type: String, default: null },
        startDate: { type: Date, default: null },
      },
    ],
    // Allergies
    allergies: [
      {
        allergen: { type: String, required: true },
        severity: {
          type: String,
          enum: ['mild', 'moderate', 'severe'],
          default: 'moderate',
        },
      },
    ],
    // Emergency contact
    emergencyContact: {
      name: { type: String, default: null },
      relationship: { type: String, default: null },
      phone: { type: String, default: null },
    },
    // Assigned clinician
    assignedClinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Profile completion status
    profileComplete: {
      type: Boolean,
      default: false,
    },
    // Consent for data processing
    dataConsent: {
      given: { type: Boolean, default: false },
      timestamp: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster lookups
PatientProfileSchema.index({ userId: 1 });
PatientProfileSchema.index({ assignedClinician: 1 });

const PatientProfile =
  mongoose.models.PatientProfile ||
  mongoose.model('PatientProfile', PatientProfileSchema);

export default PatientProfile;
