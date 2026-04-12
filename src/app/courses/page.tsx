import { CourseBrowser } from "@/components/CourseBrowser";
import { Header } from "@/components/Header";
import styles from "@/styles/App.module.scss";

export default function CoursesPage() {
  return (
    <main className={styles.pageShell}>
      <Header />
      <section className={styles.contentSection}>
        <p className={styles.kicker}>Catalog</p>
        <h1>Courses built for momentum.</h1>
        <CourseBrowser />
      </section>
    </main>
  );
}
