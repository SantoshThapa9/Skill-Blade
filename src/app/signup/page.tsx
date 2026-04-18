import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

import styles from "@/styles/Auth.module.scss";

export default function SignupPage() {
  return (
    <main className={styles.page}>
    
      <section className={styles.auth}>
        <div className={styles.authIntro}>
          <p className={styles.kicker}>Start learning</p>
          <h1>Create an account</h1>
          <p>
            Already registered? <Link href="/login">Login</Link>
          </p>
        </div>

        <AuthForm mode="signup" />
      </section>
    </main>
  );
}
