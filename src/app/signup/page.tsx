import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Header } from "@/components/Header";
import styles from "@/styles/App.module.scss";

export default function SignupPage() {
  return (
    <main className={styles.pageShell}>
      <Header />
      <section className={styles.authPage}>
        <div>
          <p className={styles.kicker}>Start clean</p>
          <h1>Create your Skill Blade account.</h1>
          <p>
            Already registered? <Link href="/login">Login</Link>
          </p>
        </div>
        <AuthForm mode="signup" />
      </section>
    </main>
  );
}
