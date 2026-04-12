import { model, models, Schema, type InferSchemaType } from "mongoose";

const lessonSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true },
    duration: { type: Number, required: true },
  },
  { _id: true },
);

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    lessons: { type: [lessonSchema], default: [] },
  },
  { timestamps: true },
);

export type CourseDocument = InferSchemaType<typeof courseSchema>;
export const Course = models.Course || model("Course", courseSchema);
