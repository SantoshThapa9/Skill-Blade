import { requireSession } from "@/lib/auth";
import { created, handleApiError, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { getDemoCourses } from "@/lib/demoCourses";
import { courseSchema } from "@/lib/validation";
import { listCourses, saveCourse } from "@/services/learning";

export async function GET() {
  try {
    await connectToDatabase();
    return ok({ courses: await listCourses() });
  } catch (error) {
    console.error("Falling back to demo courses:", error);
    return ok({ courses: getDemoCourses(), demoFallback: true });
  }
}

export async function POST(request: Request) {
  try {
    await requireSession("admin");
    await connectToDatabase();
    const input = courseSchema.parse(await request.json());
    return created({ course: await saveCourse(input) });
  } catch (error) {
    return handleApiError(error);
  }
}
