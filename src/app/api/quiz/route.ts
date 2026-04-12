import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { quizSchema, quizSubmitSchema } from "@/lib/validation";
import {
  getQuizForCourse,
  requireEnrollment,
  saveQuiz,
  scoreQuiz,
} from "@/services/learning";

export async function GET(request: NextRequest) {
  try {
    const user = await requireSession();
    await connectToDatabase();
    const courseId = request.nextUrl.searchParams.get("courseId");
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }
    await requireEnrollment(user.id, courseId);
    return ok({ quiz: await getQuizForCourse(courseId) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession();
    await connectToDatabase();
    const input = quizSubmitSchema.parse(await request.json());
    await requireEnrollment(user.id, input.courseId);
    return ok(await scoreQuiz(user.id, input.courseId, input.answers));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireSession("admin");
    await connectToDatabase();
    const input = quizSchema.parse(await request.json());
    return ok({ quiz: await saveQuiz(input.courseId, input.questions) });
  } catch (error) {
    return handleApiError(error);
  }
}
