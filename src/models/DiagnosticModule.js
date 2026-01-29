import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'scale', 'yes_no', 'text', 'body_map'],
    default: 'multiple_choice',
  },
  options: {
    type: [String],
    default: [],
  },
  required: {
    type: Boolean,
    default: true,
  },
  weight: {
    type: Number,
    default: 1,
    min: 0,
    max: 10,
  },
  conditionalOn: {
    questionId: String,
    answer: mongoose.Schema.Types.Mixed,
  },
});

const DiagnosticModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    region: {
      type: String,
      required: true,
      enum: [
        'Lumbar',
        'Cervical',
        'Shoulder',
        'Ankle',
        'Knee',
        'Elbow',
        'Hip',
        'Wrist',
        'General',
      ],
      index: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Review', 'Active', 'Archived'],
      default: 'Draft',
      index: true,
    },
    questions: {
      type: [QuestionSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    version: {
      type: Number,
      default: 1,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for question count
DiagnosticModuleSchema.virtual('questionCount').get(function () {
  return this.questions?.length || 0;
});

// Ensure virtuals are included in JSON
DiagnosticModuleSchema.set('toJSON', { virtuals: true });
DiagnosticModuleSchema.set('toObject', { virtuals: true });

export default mongoose.models.DiagnosticModule ||
  mongoose.model('DiagnosticModule', DiagnosticModuleSchema);
