import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Header } from "@/components/Header";
import styles from "@/styles/App.module.scss";

export default function LoginPage() {
  return (
    <main className={styles.pageShell}>
      <Header />
      <section className={styles.authPage}>
        <div>
          <p className={styles.kicker}>Welcome back</p>
          <h1>Login to keep learning.</h1>
          <p>
            New here? <Link href="/signup">Create an account</Link>
          </p>
        </div>
        <AuthForm mode="login" />
      </section>
    </main>
  );
}
