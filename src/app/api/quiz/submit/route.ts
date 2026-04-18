import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Course } from "@/models/Course";
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

  await connectToDatabase();
  const course = await Course.findById(courseId).lean();

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

  // Update progress
  await User.findOneAndUpdate(
    { _id: user.id, "progress.courseId": courseId },
    { $set: { "progress.$.quizCompleted": true } },
    { new: true },
  ).exec();

  // If score >= 70%, add to completed courses
  if (score >= 70) {
    await User.findByIdAndUpdate(user.id, {
      $addToSet: { completedCourses: courseId },
    });
  }

  return NextResponse.json({
    score,
    total: questions.length,
    correct,
    completed: score >= 70,
  });
}
