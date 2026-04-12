import { requireSession } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { getDemoCourse } from "@/lib/demoCourses";
import { courseSchema } from "@/lib/validation";
import { deleteCourse, getCourse, saveCourse } from "@/services/learning";

type Context = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    await connectToDatabase();
    const { courseId } = await context.params;
    return ok({ course: await getCourse(courseId) });
  } catch (error) {
    const { courseId } = await context.params;
    const demoCourse = getDemoCourse(courseId);
    if (demoCourse) {
      return ok({ course: demoCourse, demoFallback: true });
    }
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    await requireSession("admin");
    await connectToDatabase();
    const { courseId } = await context.params;
    const input = courseSchema.parse(await request.json());
    return ok({ course: await saveCourse(input, courseId) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    await requireSession("admin");
    await connectToDatabase();
    const { courseId } = await context.params;
    await deleteCourse(courseId);
    return ok({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
