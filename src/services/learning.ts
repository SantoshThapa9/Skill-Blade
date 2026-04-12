import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Types } from "mongoose";
import { Certificate } from "@/models/Certificate";
import { Course } from "@/models/Course";
import { Progress } from "@/models/Progress";
import { Quiz } from "@/models/Quiz";
import { User } from "@/models/User";
import { demoCourses } from "@/lib/demoCourses";

export function serializeDoc<T>(doc: T) {
  return JSON.parse(JSON.stringify(doc));
}

export async function ensureDemoCourses() {
  const results = [];

  for (const demoCourse of demoCourses) {
    const { _id, quiz, ...courseInput } = demoCourse;
    const course = await Course.findOneAndUpdate(
      { _id },
      { $setOnInsert: { _id, ...courseInput } },
      { upsert: true, new: true },
    );

    const quizDoc = await Quiz.findOneAndUpdate(
      { courseId: course._id },
      { $setOnInsert: { courseId: course._id, questions: quiz } },
      { upsert: true, new: true },
    );

    results.push({
      courseId: course._id.toString(),
      title: course.title,
      quizId: quizDoc._id.toString(),
    });
  }

  return serializeDoc(results);
}

export async function listCourses() {
  await ensureDemoCourses();
  return serializeDoc(await Course.find().sort({ createdAt: -1 }).lean());
}

export async function getCourse(courseId: string) {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new Error("Course not found");
  return serializeDoc(course);
}

export async function enrollUser(userId: string, courseId: string) {
  await Course.findById(courseId).orFail(new Error("Course not found"));

  await User.findByIdAndUpdate(userId, {
    $addToSet: { enrolledCourses: courseId },
  });

  const progress = await Progress.findOneAndUpdate(
    { userId, courseId },
    { $setOnInsert: { completedLessons: [], score: 0 } },
    { upsert: true, new: true },
  );

  return serializeDoc(progress);
}

export async function requireEnrollment(userId: string, courseId: string) {
  const user = await User.findOne({
    _id: userId,
    enrolledCourses: courseId,
  }).lean();

  if (!user) {
    throw new Response(JSON.stringify({ error: "Enrollment required" }), {
      status: 403,
    });
  }
}

export async function updateProgress(
  userId: string,
  courseId: string,
  lessonId?: string,
  score?: number,
) {
  const update: Record<string, unknown> = {};
  if (lessonId) update.$addToSet = { completedLessons: lessonId };
  if (typeof score === "number") update.$max = { score };

  const progress = await Progress.findOneAndUpdate(
    { userId, courseId },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return serializeDoc(progress);
}

export async function getUserDashboard(userId: string) {
  const user = await User.findById(userId).populate("enrolledCourses").lean();
  const progress = await Progress.find({ userId }).lean();
  const certificates = await Certificate.find({ userId }).lean();

  return serializeDoc({ user, progress, certificates });
}

export async function getAdminDashboard() {
  await ensureDemoCourses();

  const [courses, users, progress, certificates] = await Promise.all([
    Course.find().sort({ createdAt: -1 }).lean(),
    User.find().select("-password").populate("enrolledCourses").lean(),
    Progress.find().lean(),
    Certificate.find().lean(),
  ]);

  return serializeDoc({ courses, users, progress, certificates });
}

export async function saveCourse(
  input: Record<string, unknown>,
  courseId?: string,
) {
  if (courseId) {
    const course = await Course.findByIdAndUpdate(courseId, input, {
      new: true,
      runValidators: true,
    }).orFail(new Error("Course not found"));
    return serializeDoc(course);
  }

  return serializeDoc(await Course.create(input));
}

export async function deleteCourse(courseId: string) {
  await Promise.all([
    Course.findByIdAndDelete(courseId),
    Quiz.findOneAndDelete({ courseId }),
    Progress.deleteMany({ courseId }),
    Certificate.deleteMany({ courseId }),
    User.updateMany({}, { $pull: { enrolledCourses: courseId } }),
  ]);
}

export async function saveQuiz(courseId: string, questions: unknown[]) {
  await Course.findById(courseId).orFail(new Error("Course not found"));

  const quiz = await Quiz.findOneAndUpdate(
    { courseId },
    { courseId, questions },
    { upsert: true, new: true, runValidators: true },
  );

  return serializeDoc(quiz);
}

export async function getQuizForCourse(courseId: string, includeAnswers = false) {
  const quiz = await Quiz.findOne({ courseId }).lean();
  if (!quiz) return null;

  const serialized = serializeDoc(quiz);
  if (!includeAnswers) {
    serialized.questions = serialized.questions.map(
      (question: { _id: string; prompt: string; options: string[] }) => ({
        _id: question._id,
        prompt: question.prompt,
        options: question.options,
      }),
    );
  }
  return serialized;
}

export async function scoreQuiz(
  userId: string,
  courseId: string,
  answers: number[],
) {
  const quiz = await Quiz.findOne({ courseId }).lean();
  if (!quiz) throw new Error("Quiz not found");

  const correct = quiz.questions.reduce(
    (
      total: number,
      question: { answerIndex: number },
      index: number,
    ) => total + (question.answerIndex === answers[index] ? 1 : 0),
    0,
  );
  const score = Math.round((correct / Math.max(quiz.questions.length, 1)) * 100);
  const progress = await updateProgress(userId, courseId, undefined, score);

  return { score, correct, total: quiz.questions.length, progress };
}

export async function isCourseComplete(userId: string, courseId: string) {
  const [course, progress] = await Promise.all([
    Course.findById(courseId).lean(),
    Progress.findOne({ userId, courseId }).lean(),
  ]);

  if (!course || !progress) return false;

  const completed = new Set(
    progress.completedLessons.map((id: Types.ObjectId) => id.toString()),
  );
  const allLessonsDone = course.lessons.every(
    (lesson: { _id: Types.ObjectId }) => completed.has(lesson._id.toString()),
  );

  return allLessonsDone && progress.score >= 70;
}

export async function issueCertificate(userId: string, courseId: string) {
  const complete = await isCourseComplete(userId, courseId);
  if (!complete) {
    throw new Error("Complete every lesson and score at least 70% first");
  }

  const certificate = await Certificate.findOneAndUpdate(
    { userId, courseId },
    {
      userId,
      courseId,
      issuedAt: new Date(),
      certificateUrl: `/api/certificate?courseId=${courseId}`,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return serializeDoc(certificate);
}

export async function createCertificatePdf(
  userName: string,
  courseTitle: string,
  issuedAt: Date,
) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({
    x: 32,
    y: 32,
    width: 778,
    height: 531,
    borderColor: rgb(0.05, 0.1, 0.12),
    borderWidth: 4,
  });

  page.drawText("Skill Blade", {
    x: 332,
    y: 500,
    size: 28,
    font: bold,
    color: rgb(0.05, 0.1, 0.12),
  });
  page.drawText("Certificate of Completion", {
    x: 250,
    y: 430,
    size: 30,
    font: bold,
    color: rgb(0.73, 0.08, 0.17),
  });
  page.drawText("This certifies that", { x: 340, y: 365, size: 16, font });
  page.drawText(userName, {
    x: 230,
    y: 315,
    size: 34,
    font: bold,
    color: rgb(0.05, 0.1, 0.12),
  });
  page.drawText(`has completed ${courseTitle}`, {
    x: 210,
    y: 260,
    size: 20,
    font,
    color: rgb(0.15, 0.18, 0.2),
  });
  page.drawText(`Issued ${issuedAt.toLocaleDateString("en-IN")}`, {
    x: 350,
    y: 180,
    size: 14,
    font,
  });
  page.drawText("Signed by Skill Blade Academy", {
    x: 315,
    y: 120,
    size: 14,
    font: bold,
  });

  return pdfDoc.save();
}
