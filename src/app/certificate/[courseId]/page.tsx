import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Course } from "@/models/Course";
import { User } from "@/models/User";
import Image from "next/image";
import styles from "@/styles/Course.module.scss";

export default async function CourseCertificatePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("skillToken")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = verifyToken(token);
  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();

  const course = await Course.findById(courseId).lean();
  const user = await User.findById(session.id)
    .populate("quizScores.courseId", "title")
    .exec();

  if (!course || !user) {
    return (
      <main className={styles.pageShell}>
        <section className={styles.contentSection}>
          <div className={styles.detailLayout}>
            <div className={styles.card}>
              <h1>Certificate not available</h1>
              <p>
                We could not find the selected course or your completion data.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const scoreEntry = user.quizScores.find(
    (entry) =>
      String((entry.courseId as any)?._id || entry.courseId) === courseId,
  );

  if (!scoreEntry) {
    return (
      <main className={styles.pageShell}>
        <section className={styles.contentSection}>
          <div className={styles.detailLayout}>
            <div className={styles.card}>
              <h1>Certificate not yet earned</h1>
              <p>
                You have not completed the quiz for{" "}
                <strong>{course.title}</strong>.
              </p>
              <p className={styles.notice}>
                Finish the course quiz and score 70% or higher to unlock your
                certificate.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const score = scoreEntry.score;
  const eligible = score >= 70;

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className={styles.pageShell}>
      <section className={styles.contentSection}>
        <div className={styles.certificate}>
          <div className={styles.certificateHeader}>
            <Image
              src={"/favicon.ico"}
              alt="SkillBlade Assistant"
              width={40}
              height={40}
            />
            <span className={styles.brand}>SkillBlade</span>

            <p className={styles.certificateTitle}>CERTIFICATE OF COMPLETION</p>
          </div>

          <p className={styles.certificateSubtitle}>This is to certify that</p>

          <h1 className={styles.certificateName}>{session.name}</h1>

          <p className={styles.certificateText}>
            has successfully completed the course
          </p>

          <h2 className={styles.courseName}>{course.title}</h2>

          <div className={styles.certificateMeta}>
            <div>
              <p className={styles.metaLabel}>Quiz Score</p>
              <p className={styles.metaValue}>{score}%</p>
            </div>

            <div>
              <p className={styles.metaLabel}>Date of Completion</p>
              <p className={styles.metaValue}>{currentDate}</p>
            </div>
          </div>

          <p className={styles.certificateFooter}>
            {eligible
              ? "This certificate recognizes demonstrated competency and commitment to learning."
              : "Congratulations on completing this course!"}
          </p>
        </div>

        <div className={styles.certificateActions}>
          <a className={styles.primaryButton} href="/certificate">
            Back to All Certificates
          </a>
        </div>
      </section>
    </main>
  );
}
