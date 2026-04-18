import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Course, type CourseDocument } from "@/models/Course";
import { User } from "@/models/User";
import { getSession, requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const courseId = url.pathname.split("/").pop();
  if (!courseId) {
    return NextResponse.json({ error: "Missing course id." }, { status: 400 });
  }

  let course: CourseDocument | null = null;

  try {
    await connectToDatabase();
    course = await Course.findById(courseId).lean();
  } catch {
    return NextResponse.json(
      { error: "Unable to load course." },
      { status: 500 },
    );
  }

  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const courseIdString = String((course as { _id?: unknown })._id ?? "");
  const publicCourse = {
    ...course,
    _id: courseIdString,
    quiz: {
      questions:
        course.quiz?.questions.map(
          (item: { prompt: string; options: string[] }) => ({
            prompt: item.prompt,
            options: item.options,
          }),
        ) ?? [],
    },
  };

  const session = getSession(request);
  let enrolled = false;
  let progress: { watchedLessons: string[]; quizCompleted: boolean } = { watchedLessons: [], quizCompleted: false };
  let completed = false;

  if (session) {
    const user = await User.findById(session.id).lean();
    enrolled = Boolean(
      user?.enrolledCourses?.some(
        (courseRef: { toString(): string }) =>
          courseRef.toString() === courseId,
      ),
    );
    if (enrolled) {
      const userProgress = user?.progress?.find(
        (p: { courseId: { toString(): string } }) => p.courseId.toString() === courseId
      );
      if (userProgress) {
        progress = {
          watchedLessons: userProgress.watchedLessons,
          quizCompleted: userProgress.quizCompleted,
        };
      }
      completed = Boolean(
        user?.completedCourses?.some(
          (courseRef: { toString(): string }) =>
            courseRef.toString() === courseId,
        ),
      );
    }
  }

  return NextResponse.json({ course: publicCourse, enrolled, progress, completed });
}

export async function DELETE(request: Request) {
  const session = await requireAuth(request, "admin");
  const url = new URL(request.url);
  const courseId = url.pathname.split("/").pop();

  if (!courseId) {
    return NextResponse.json(
      { error: "Course id is required." },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const course = await Course.findById(courseId);
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  if (
    !course.createdBy?.toString?.() ||
    course.createdBy.toString() !== session.id
  ) {
    return NextResponse.json(
      { error: "Only the creator can delete this course." },
      { status: 403 },
    );
  }

  await Course.findByIdAndDelete(courseId);
  return NextResponse.json({ success: true });
}
