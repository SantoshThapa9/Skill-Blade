import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getDemoCourse } from "@/lib/demoCourse";
import { User } from "@/models/User";
import { Course } from "@/models/Course";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireAuth(request);
  const body = await request.json().catch(() => null);
  const courseId = String(body?.courseId ?? "").trim();

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required." },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const course = await Course.findById(courseId);
  const demoCourse = course ? null : getDemoCourse(courseId);
  if (!course && !demoCourse) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const enrolledCourseId = course
    ? course._id
    : mongoose.isValidObjectId(courseId)
      ? new mongoose.Types.ObjectId(courseId)
      : courseId;

  await User.findByIdAndUpdate(user.id, {
    $addToSet: { enrolledCourses: enrolledCourseId },
  });

  return NextResponse.json({ success: true });
}
