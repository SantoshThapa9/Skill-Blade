import { requireSession } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { getAdminDashboard } from "@/services/learning";

export async function GET() {
  try {
    await requireSession("admin");
    await connectToDatabase();
    return ok(await getAdminDashboard());
  } catch (error) {
    return handleApiError(error);
  }
}
