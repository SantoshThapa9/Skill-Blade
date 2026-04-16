import Link from "next/link";
import { Header } from "@/components/Header";
import styles from "@/styles/App.module.scss";

export default function Home() {
  return (
    <main className={styles.pageShell}>
      <Header />
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Skill Blade</p>
          <h1>Sharper courses for sharper careers.</h1>
          <p>
            Signup, create courses, enroll, and take a quiz with a minimal JWT
            auth flow.
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
