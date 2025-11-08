import mongoose from 'mongoose';

const { Schema } = mongoose;

const scoreSchema = new Schema(
  {
    functionality: { type: Number, min: 0, max: 5 },
    reliability: { type: Number, min: 0, max: 5 },
    usability: { type: Number, min: 0, max: 5 },
    efficiency: { type: Number, min: 0, max: 5 },
    maintainability: { type: Number, min: 0, max: 5 },
  },
  { _id: false }
);

const evaluationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    evaluatorName: { type: String, required: true },
    evaluatorEmail: { type: String, required: true },
    projectName: { type: String, required: true, trim: true },
    comments: { type: String },
    scores: scoreSchema,
    totalScore: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['draft', 'submitted'], default: 'submitted' },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true, collection: 'evaluations' }
);

export const Evaluation = mongoose.models.Evaluation || mongoose.model('Evaluation', evaluationSchema);
