import mongoose from 'mongoose';

const CaseFileSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiagnosisSession',
      default: null,
      index: true,
    },
    // The format: firstname_lastname-file
    caseFileId: {
      type: String,
      required: true,
      unique: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String, // Cloudinary URL
      required: true,
    },
    fileType: {
      type: String, // e.g., 'image/png', 'application/pdf'
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
    },
    category: {
      type: String,
      enum: ['X-Ray', 'MRI', 'Lab Results', 'Prescription', 'Other'],
      default: 'Other',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searches by patient
CaseFileSchema.index({ patientId: 1, uploadedAt: -1 });

const CaseFile = mongoose.models.CaseFile || mongoose.model('CaseFile', CaseFileSchema);

export default CaseFile;
