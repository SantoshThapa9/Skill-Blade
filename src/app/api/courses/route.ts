import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDemoCourses } from "@/lib/demoCourse";
import { Course } from "@/models/Course";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const demo = getDemoCourses();
  type CourseResponse = ReturnType<typeof getDemoCourses>[number];
  try {
    await connectToDatabase();
    const courses = await Course.find().lean();
    const normalized = courses.map<CourseResponse>((course) => ({
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
    }));
    const byId = new Map<string, CourseResponse>(
      demo.map((course) => [course._id, course]),
    );
    for (const course of normalized) {
      if (course?._id) byId.set(String(course._id), course);
    }
    return NextResponse.json({ courses: Array.from(byId.values()) });
  } catch {
    return NextResponse.json({ courses: demo, demoOnly: true });
  }
}

export async function POST(request: Request) {
  await requireAuth(request, "admin");
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
