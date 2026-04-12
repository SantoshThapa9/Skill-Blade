import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { Course } from "@/models/Course";
import { User } from "@/models/User";
import {
  createCertificatePdf,
  issueCertificate,
  serializeDoc,
} from "@/services/learning";

export async function POST(request: Request) {
  try {
    const user = await requireSession();
    await connectToDatabase();
    const { courseId } = await request.json();
    return ok({ certificate: await issueCertificate(user.id, courseId) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    await connectToDatabase();
    const courseId = request.nextUrl.searchParams.get("courseId");
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const certificate = await Certificate.findOne({
      userId: session.id,
      courseId,
    }).lean();
    if (!certificate) {
      return NextResponse.json({ error: "Certificate not issued" }, { status: 404 });
    }

    const [user, course] = await Promise.all([
      User.findById(session.id).lean(),
      Course.findById(courseId).lean(),
    ]);
    if (!user || !course) {
      return NextResponse.json({ error: "Certificate data missing" }, { status: 404 });
    }

    const cert = serializeDoc(certificate);
    const pdf = await createCertificatePdf(
      user.name,
      course.title,
      new Date(cert.issuedAt),
    );

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${course.title.replaceAll(" ", "-")}-certificate.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
