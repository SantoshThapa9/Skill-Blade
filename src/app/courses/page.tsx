import { Header } from "@/components/Header";
import { CourseList } from "@/components/CourseList";
import styles from "@/styles/App.module.scss";

export default function CoursesPage() {
  return (
    <main className={styles.pageShell}>
      <Header />
      <section className={styles.contentSection}>
        <p className={styles.kicker}>Courses</p>
        <h1>Browse the available courses.</h1>
        <CourseList />
      </section>
    </main>
  );
}
