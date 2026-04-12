import { requireSession } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { enrollSchema } from "@/lib/validation";
import { enrollUser, getUserDashboard } from "@/services/learning";

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
    const input = enrollSchema.parse(await request.json());
    return ok({ progress: await enrollUser(user.id, input.courseId) });
  } catch (error) {
    return handleApiError(error);
  }
}
