import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
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
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const enrolledCourseId = course._id;

  await User.findByIdAndUpdate(user.id, {
    $addToSet: { enrolledCourses: enrolledCourseId },
  });

  return NextResponse.json({ success: true });
}
