"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setAuthUser } from "@/redux/authSlice";
import styles from "@/styles/Auth.module.scss";

type Props = {
  mode: "login" | "signup";
};

type AuthResponse = {
  user?: { id: string; name: string; role: "user" | "admin" };
  error?: string;
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      role: isAdmin ? "admin" : "user",
      adminPasscode: String(form.get("adminPasscode") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: AuthResponse = await response
      .json()
      .catch(() => ({ error: "Invalid server response." }));
    setLoading(false);

    if (!response.ok || data.error) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    if (data.user) {
      dispatch(
        setAuthUser({
          id: data.user.id,
          name: data.user.name,
          role: data.user.role,
        }),
      );
      router.push("/courses");
    }
  }

  return (
    <form onSubmit={submit} className={styles.form}>
      {mode === "signup" && (
        <label className={styles.field}>
          <span>Name</span>
          <input name="name" minLength={2} required />
        </label>
      )}

      <label className={styles.field}>
        <span>Email</span>
        <input name="email" type="email" required />
      </label>

      <label className={styles.field}>
        <span>Password</span>
        <input name="password" type="password" minLength={6} required />
      </label>

      {mode === "signup" && (
        <>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            <span>Sign up as admin</span>
          </label>

          {isAdmin && (
            <div className={styles.adminSection}>
              <label className={styles.field}>
                <span>Admin passcode</span>
                <input name="adminPasscode" type="password" required />
              </label>

              <label className={styles.field}>
                <span>Course type</span>
                <select name="courseType" required>
                  <option value="">Select</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Experience</span>
                <select name="experienceLevel" required>
                  <option value="">Select</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Admin goal</span>
                <textarea name="adminGoal" required />
              </label>

              <label className={styles.field}>
                <span>Portfolio (optional)</span>
                <input name="portfolio" type="url" />
              </label>
            </div>
          )}
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.button} disabled={loading}>
        {loading
          ? "Working..."
          : mode === "signup"
            ? "Create account"
            : "Login"}
      </button>
    </form>
  );
}
