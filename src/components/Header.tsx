"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearAuthUser } from "@/redux/authSlice";
import styles from "@/styles/App.module.scss";

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  function logout() {
    document.cookie = "skillToken=; Path=/; Max-Age=0";
    document.cookie = "skillUser=; Path=/; Max-Age=0";
    dispatch(clearAuthUser());
    router.push("/login");
  }

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <span>Skill</span> Blade
      </Link>
      <nav className={styles.nav}>
        <Link href="/courses">Courses</Link>
        {user ? (
          <>
            {user.role === "admin" ? <Link href="/admin">Admin</Link> : null}
            <span className={styles.greeting}>Hello, {user.name}</span>
            <button type="button" onClick={logout}>
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
