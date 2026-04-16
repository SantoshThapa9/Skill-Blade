import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDemoCourse } from "@/lib/demoCourse";
import { Course, type CourseDocument } from "@/models/Course";
import { User } from "@/models/User";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireAuth(request);
  const body = await request.json().catch(() => null);
  const courseId = String(body?.courseId ?? "").trim();
  const answers = Array.isArray(body?.answers) ? body.answers : [];

  if (!courseId || answers.length === 0) {
    return NextResponse.json(
      { error: "courseId and answers are required." },
      { status: 400 },
    );
  }

  type CoursePayload = CourseDocument | ReturnType<typeof getDemoCourse>;

  await connectToDatabase();
  let course: CoursePayload | null = await Course.findById(courseId).lean();
  if (!course) {
    course = getDemoCourse(courseId);
  }

  if (!course || !course.quiz?.questions?.length) {
    return NextResponse.json(
      { error: "Quiz not found for this course." },
      { status: 404 },
    );
  }

  const questions = course.quiz.questions;
  const correct = questions.reduce(
    (count: number, question: { answerIndex: number }, index: number) => {
      return count + (Number(answers[index]) === question.answerIndex ? 1 : 0);
    },
    0,
  );
  const score = Math.round((correct / questions.length) * 100);

  await User.findByIdAndUpdate(user.id, {
    $pull: { quizScores: { courseId } },
    $push: { quizScores: { courseId, score } },
  });

  return NextResponse.json({ score, total: questions.length, correct });
}
