import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireAuth(request);
  const url = new URL(request.url);
  const courseId = url.pathname.split("/").slice(-2)[0]; // Assuming /api/courses/[courseId]/progress
  const body = await request.json().catch(() => null);
  const lessonId = String(body?.lessonId ?? "").trim();

  if (!courseId || !lessonId) {
    return NextResponse.json(
      { error: "Course ID and lesson ID are required." },
      { status: 400 },
    );
  }

  await connectToDatabase();

  // Check if enrolled
  const userDoc = await User.findById(user.id);
  if (!userDoc?.enrolledCourses?.some((id) => id.toString() === courseId)) {
    return NextResponse.json(
      { error: "Not enrolled in this course." },
      { status: 403 },
    );
  }

  const progressIndex = userDoc.progress.findIndex(
    (p) => p.courseId.toString() === courseId,
  );

  if (progressIndex >= 0) {
    // Existing progress, add lesson if not already watched
    if (
      !userDoc.progress[progressIndex].watchedLessons.some(
        (id) => id.toString() === lessonId,
      )
    ) {
      userDoc.progress[progressIndex].watchedLessons.push(lessonId);
    }
  } else {
    // No progress yet, create new
    userDoc.progress.push({
      courseId: new Types.ObjectId(courseId),
      watchedLessons: [lessonId],
      quizCompleted: false,
    });
  }

  await userDoc.save();

  return NextResponse.json({ success: true });
}
