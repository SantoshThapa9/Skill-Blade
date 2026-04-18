import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

import styles from "@/styles/Auth.module.scss";

export default function LoginPage() {
  return (
    <main className={styles.page}>
    
      <section className={styles.auth}>
        <div className={styles.authIntro}>
          <p className={styles.kicker}>Welcome back</p>
          <h1>Login to your account</h1>
          <p>
            New here? <Link href="/signup">Create account</Link>
          </p>
        </div>

        <AuthForm mode="login" />
      </section>
    </main>
  );
}
