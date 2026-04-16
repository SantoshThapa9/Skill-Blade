import { CourseDetail } from "@/components/CourseDetail";
import { Header } from "@/components/Header";
import styles from "@/styles/App.module.scss";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <main className={styles.pageShell}>
      <Header />
      <section className={styles.contentSection}>
        <CourseDetail courseId={courseId} />
      </section>
    </main>
  );
}
