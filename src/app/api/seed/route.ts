import { handleApiError, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { ensureDemoCourses } from "@/services/learning";

export async function GET() {
  try {
    await connectToDatabase();
    return ok({ seeded: await ensureDemoCourses() });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST() {
  return GET();
}
