import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Course } from "@/models/Course";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectToDatabase();
    const courses = await Course.find().lean();
    const normalized = courses.map((course) => ({
      _id: course._id?.toString?.() ?? String(course._id ?? ""),
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      lessons: Array.isArray(course.lessons)
        ? course.lessons.map((lesson) => ({
            _id: lesson._id?.toString?.() ?? String(lesson._id ?? ""),
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
          }))
        : [],
      quiz: {
        questions: Array.isArray(course.quiz?.questions)
          ? course.quiz.questions.map((question) => ({
              prompt: question.prompt,
              options: question.options,
              answerIndex: question.answerIndex,
            }))
          : [],
      },
      createdBy: course.createdBy?.toString?.() ?? "",
      createdByName: course.createdByName ?? "Admin",
    }));

    return NextResponse.json({ courses: normalized });
  } catch {
    return NextResponse.json(
      { error: "Unable to load courses." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await requireAuth(request, "admin");
  const body = await request.json().catch(() => null);
  const course = {
    title: String(body?.title ?? "").trim(),
    description: String(body?.description ?? "").trim(),
    thumbnail: String(body?.thumbnail ?? "").trim(),
    lessons: Array.isArray(body?.lessons) ? body.lessons : [],
    quiz: {
      questions: Array.isArray(body?.quiz?.questions)
        ? body.quiz.questions
        : [],
    },
    createdBy: session.id,
    createdByName: session.name,
  };

  if (!course.title || !course.description) {
    return NextResponse.json(
      { error: "Title and description are required." },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const createdCourse = await Course.create(course);
  return NextResponse.json({ course: createdCourse });
}
export async function PUT(request: Request) {
  const session = await requireAuth(request, "admin");

  const body = await request.json().catch(() => null);

  const id = String(body?._id || "").trim();

  if (!id) {
    return NextResponse.json(
      { error: "Course ID is required." },
      { status: 400 },
    );
  }

  const updatedData = {
    title: String(body?.title ?? "").trim(),
    description: String(body?.description ?? "").trim(),
    thumbnail: String(body?.thumbnail ?? "").trim(),
    lessons: Array.isArray(body?.lessons) ? body.lessons : [],
    quiz: {
      questions: Array.isArray(body?.quiz?.questions)
        ? body.quiz.questions
        : [],
    },
  };

  if (!updatedData.title || !updatedData.description) {
    return NextResponse.json(
      { error: "Title and description are required." },
      { status: 400 },
    );
  }

  await connectToDatabase();

  const existingCourse = await Course.findById(id);
  if (!existingCourse) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  if (
    !existingCourse.createdBy?.toString?.() ||
    existingCourse.createdBy.toString() !== session.id
  ) {
    return NextResponse.json(
      { error: "Only the creator can modify this course." },
      { status: 403 },
    );
  }

  const updatedCourse = await Course.findByIdAndUpdate(id, updatedData, {
    new: true,
  }).lean();

  if (!updatedCourse) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  return NextResponse.json({ course: updatedCourse });
}
