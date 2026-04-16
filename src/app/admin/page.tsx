import { AdminPanel } from "@/components/AdminPanel";
import { Header } from "@/components/Header";
import styles from "@/styles/App.module.scss";

export default function AdminPage() {
  return (
    <main className={styles.pageShell}>
      <Header />
      <section className={styles.contentSection}>
        <AdminPanel />
      </section>
    </main>
  );
}
