import { model, models, Schema, type InferSchemaType } from "mongoose";

const questionSchema = new Schema(
  {
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    answerIndex: { type: Number, required: true, min: 0, max: 3 },
  },
  { _id: true },
);

const quizSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
    },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true },
);

export type QuizDocument = InferSchemaType<typeof quizSchema>;
export const Quiz = models.Quiz || model("Quiz", quizSchema);
