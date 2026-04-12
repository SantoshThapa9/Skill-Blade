import { DashboardClient } from "@/components/DashboardClient";
import { Header } from "@/components/Header";
import styles from "@/styles/App.module.scss";

export default function DashboardPage() {
  return (
    <main className={styles.pageShell}>
      <Header />
      <section className={styles.contentSection}>
        <DashboardClient />
      </section>
    </main>
  );
}
