import Link from "next/link";
import { Header } from "@/components/Header";
import styles from "@/styles/App.module.scss";

export default function Home() {
  return (
    <main className={styles.pageShell}>
      <Header />
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Skill Blade Academy</p>
          <h1>Sharper courses for sharper careers.</h1>
          <p>
            Learn with focused lessons, quizzes that prove progress, and
            certificates you can download the moment you finish.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/courses">
              Browse courses
            </Link>
            <Link href="/signup">Create account</Link>
          </div>
        </div>
      </section>
      <section className={styles.featureBand}>
        <article>
          <h2>Watch</h2>
          <p>Stream course lessons from stored URLs or Cloudinary links.</p>
        </article>
        <article>
          <h2>Practice</h2>
          <p>Take MCQ quizzes and keep the best score per course.</p>
        </article>
        <article>
          <h2>Certify</h2>
          <p>Complete every lesson, pass the quiz, and download a PDF.</p>
        </article>
      </section>
    </main>
  );
}
