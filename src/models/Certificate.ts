import { model, models, Schema, type InferSchemaType } from "mongoose";

const certificateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    issuedAt: { type: Date, default: Date.now },
    certificateUrl: { type: String, required: true },
  },
  { timestamps: true },
);

certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export type CertificateDocument = InferSchemaType<typeof certificateSchema>;
export const Certificate =
  models.Certificate || model("Certificate", certificateSchema);
