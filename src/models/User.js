import mongoose from 'mongoose';

const ROLES = {
  PATIENT: 'PATIENT',
  CLINICIAN: 'CLINICIAN',
  ADMIN: 'ADMIN',
};

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.PATIENT,
      required: true,
    },
    avatar: {
      type: String,
      default: null, // Cloudinary URL
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    // Clinician-specific fields
    specialization: {
      type: String,
      default: null,
    },
    licenseNumber: {
      type: String,
      default: null,
    },
    // Patient-specific fields
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say', null],
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    // Clinician Extended Profile
    timezone: { type: String, default: 'UTC' },
    bio: { type: String, maxlength: 500 },

    // Professional Details
    professional: {
      licenseNumber: { type: String },
      licenseBody: { type: String },
      experienceYears: { type: Number, default: 0 },
      specializations: [{ type: String }],
      primaryPracticeArea: { type: String },
      verified: { type: Boolean, default: false },
    },

    // Clinical Preferences
    clinical: {
      defaultModules: [{ type: String }],
      painScale: { type: String, enum: ['VAS'], default: 'VAS' },
      autoSuggestTests: { type: Boolean, default: true },
    },

    // Availability
    availability: {
      sessionBuffer: { type: Number, default: 15 }, // minutes
      acceptNewPatients: { type: Boolean, default: true },
      schedule: {
        monday: {
          enabled: { type: Boolean, default: true },
          timeSlots: [{ start: String, end: String }],
        },
        tuesday: {
          enabled: { type: Boolean, default: true },
          timeSlots: [{ start: String, end: String }],
        },
        wednesday: {
          enabled: { type: Boolean, default: true },
          timeSlots: [{ start: String, end: String }],
        },
        thursday: {
          enabled: { type: Boolean, default: true },
          timeSlots: [{ start: String, end: String }],
        },
        friday: {
          enabled: { type: Boolean, default: true },
          timeSlots: [{ start: String, end: String }],
        },
        saturday: { enabled: { type: Boolean, default: false }, timeSlots: [] },
        sunday: { enabled: { type: Boolean, default: false }, timeSlots: [] },
      },
    },

    // Notifications
    notifications: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      events: [{ type: String }], // 'new_patient', 'assessment_completed', etc.
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for faster queries (email index handled by unique: true)
UserSchema.index({ role: 1 });

// Prevent model recompilation in development
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export { ROLES };
export default User;
