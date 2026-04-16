import {
  model,
  models,
  Schema,
  type InferSchemaType,
  type Model,
} from "mongoose";

export type Role = "user" | "admin";

const quizScoreSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    score: { type: Number, required: true },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    quizScores: { type: [quizScoreSchema], default: [] },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User: Model<UserDocument> =
  (models.User as Model<UserDocument>) ||
  model<UserDocument>("User", userSchema);
