"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearAuthUser } from "@/redux/authSlice";
import styles from "@/styles/Header.module.scss";
import { useState } from "react";
import { Menu } from "lucide-react";

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
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
      <button
        className={styles.menuButton}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <Menu />
      </button>
      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
        <Link href="/courses">Courses</Link>
        <Link href="/about">About</Link>
        {user ? (
          <>
            {user.role === "admin" && <Link href="/admin">Admin</Link>}
            <button onClick={logout}>Logout</button>
            <Link href="/certificate">Certificate</Link>
            <span className={styles.greeting}>{user?.name}</span>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup" className={styles.navCta}>
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
