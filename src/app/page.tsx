import Link from "next/link";
import styles from "@/styles/App.module.scss";

export default function Home() {
  return (
    <main className={styles.pageShell}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Skill Blade</p>
          <h1>Sharper courses for sharper careers.</h1>
          <p>
            Skill Blade helps you learn in-demand skills, enroll in expert-led
            courses, and earn certifications to advance your career.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/courses">
              Browse courses
            </Link>
            <Link href="/signup">Create account</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
