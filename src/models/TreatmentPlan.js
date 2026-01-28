import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  goal: String,
  activeTreatment: String,
  homeExercise: String,
});

const TreatmentPlanSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    therapistName: {
      type: String,
      required: true,
    },
    conditionName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'inactive'],
      default: 'active',
    },
    activities: [ActivitySchema],
    progress: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const TreatmentPlan =
  mongoose.models.TreatmentPlan || mongoose.model('TreatmentPlan', TreatmentPlanSchema);

export default TreatmentPlan;
