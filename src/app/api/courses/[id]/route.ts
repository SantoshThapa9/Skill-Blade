import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDemoCourse } from "@/lib/demoCourse";
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

  type CoursePayload = CourseDocument | ReturnType<typeof getDemoCourse>;
  let course: CoursePayload | null = null;
  let databaseAvailable = true;

  try {
    await connectToDatabase();
    course = await Course.findById(courseId).lean();
  } catch {
    databaseAvailable = false;
  }

  if (!course) {
    course = getDemoCourse(courseId);
  }

  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const session = getSession(request);
  let enrolled = false;

  if (session && databaseAvailable) {
    const user = await User.findById(session.id).lean();
    enrolled = Boolean(
      user?.enrolledCourses?.some(
        (courseRef: { toString(): string }) =>
          courseRef.toString() === courseId,
      ),
    );
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

  return NextResponse.json({ course: publicCourse, enrolled });
}

export async function PUT(request: Request) {
  await requireAuth(request, "admin");
  const body = await request.json().catch(() => null);
  const courseId = String(body?.courseId ?? "").trim();
  if (!courseId) {
    return NextResponse.json({ error: "Missing course id." }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await Course.findByIdAndUpdate(
    courseId,
    {
      title: String(body?.title ?? "").trim(),
      description: String(body?.description ?? "").trim(),
      thumbnail: String(body?.thumbnail ?? "").trim(),
      lessons: Array.isArray(body?.lessons) ? body.lessons : [],
      quiz: {
        questions: Array.isArray(body?.quiz?.questions)
          ? body.quiz.questions
          : [],
      },
    },
    { new: true },
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  return NextResponse.json({ course: updated });
}

export async function DELETE(request: Request) {
  await requireAuth(request, "admin");
  const url = new URL(request.url);
  const courseId = url.pathname.split("/").pop();
  if (!courseId) {
    return NextResponse.json({ error: "Missing course id." }, { status: 400 });
  }

  await connectToDatabase();
  await Course.findByIdAndDelete(courseId);
  return NextResponse.json({ success: true });
}
