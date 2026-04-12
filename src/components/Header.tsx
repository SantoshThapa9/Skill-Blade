"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import styles from "@/styles/App.module.scss";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <span>Skill</span> Blade
      </Link>
      <nav className={styles.nav}>
        <Link href="/courses">Courses</Link>
        {user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            {user.role === "admin" ? <Link href="/admin">Admin</Link> : null}
            <button onClick={() => signOut({ callbackUrl: "/login" })}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup" className={styles.navCta}>
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
