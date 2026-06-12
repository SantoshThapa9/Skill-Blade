import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Course } from "@/models/Course";
import { User } from "@/models/User";
import styles from "@/styles/Course.module.scss";
export default async function CertificatePage() {
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

  const user = await User.findById(session.id)
    .populate("quizScores.courseId", "title")
    .exec();

  if (!user) {
    redirect("/login");
  }

  const quizEntries = user.quizScores.map((entry) => {
    const course = entry.courseId;
    let courseId = "";
    let title = "Course";

    if (typeof course === "string") {
      courseId = course;
    } else if (course && typeof course === "object") {
      // populated document or ObjectId-like object
      courseId = String((course as any)._id ?? course.toString());
      title = (course as any).title ?? title;
    }

    const score = entry.score ?? 0;

    return {
      courseId,
      title,
      score,
      eligible: score >= 70,
    };
  });

  return (
    <main className={styles.pageShell}>
      <section className={styles.contentSection}>
        <div className={styles.detailLayout}>
          <div className={styles.card}>
            <h1>Welcome back, {session.name}!</h1>
            <p>Here are your quiz certificates and progress.</p>

            {quizEntries.length === 0 ? (
              <p className={styles.notice}>
                No quizzes completed yet. Finish a course quiz to unlock a
                certificate.
              </p>
            ) : (
              <div className={styles.section}>
                {quizEntries.map((entry) => (
                  <div key={entry.courseId} className={styles.card}>
                    <h2>{entry.title}</h2>
                    <p>Score: {entry.score}%</p>
                    <p>
                      {entry.eligible
                        ? "Certificate available"
                        : "Not yet eligible - 70% required."}
                    </p>
                    <div className={styles.cardActions}>
                      <a
                        className={styles.primaryButton}
                        href={`/certificate/${entry.courseId}`}
                      >
                        View Certificate
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
