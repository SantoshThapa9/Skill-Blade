import { model, models, Schema, type InferSchemaType } from "mongoose";

const progressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: [{ type: Schema.Types.ObjectId }],
    score: { type: Number, default: 0 },
  },
  { timestamps: true },
);

progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export type ProgressDocument = InferSchemaType<typeof progressSchema>;
export const Progress =
  models.Progress || model("Progress", progressSchema);
