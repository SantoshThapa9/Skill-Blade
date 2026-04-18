import {
  model,
  models,
  Schema,
  type InferSchemaType,
  type Model,
} from "mongoose";

const lessonSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true },
    duration: { type: Number, required: true },
  },
  { _id: true },
);

const questionSchema = new Schema(
  {
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    answerIndex: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    lessons: { type: [lessonSchema], default: [] },
    quiz: {
      questions: { type: [questionSchema], default: [] },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdByName: { type: String, default: "Admin" },
  },
  { timestamps: true },
);

export type CourseDocument = InferSchemaType<typeof courseSchema>;
export const Course: Model<CourseDocument> =
  (models.Course as Model<CourseDocument>) ||
  model<CourseDocument>("Course", courseSchema);
