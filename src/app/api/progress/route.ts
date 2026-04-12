import { requireSession } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { progressSchema } from "@/lib/validation";
import {
  getUserDashboard,
  requireEnrollment,
  updateProgress,
} from "@/services/learning";

export async function GET() {
  try {
    const user = await requireSession();
    await connectToDatabase();
    return ok(await getUserDashboard(user.id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession();
    await connectToDatabase();
    const input = progressSchema.parse(await request.json());
    await requireEnrollment(user.id, input.courseId);
    return ok({
      progress: await updateProgress(
        user.id,
        input.courseId,
        input.lessonId,
        input.score,
      ),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
