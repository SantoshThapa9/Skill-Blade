import { LearnClient } from "@/components/LearnClient";
import { Header } from "@/components/Header";
import styles from "@/styles/App.module.scss";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <main className={styles.pageShell}>
      <Header />
      <section className={styles.contentSection}>
        <LearnClient courseId={courseId} />
      </section>
    </main>
  );
}
