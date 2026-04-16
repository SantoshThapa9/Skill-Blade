"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setAuthUser } from "@/redux/authSlice";
import styles from "@/styles/App.module.scss";

type Props = {
  mode: "login" | "signup";
};

type AuthResponse = {
  user?: { name: string; role: "user" | "admin" };
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
      dispatch(setAuthUser({ name: data.user.name, role: data.user.role }));
      router.push("/courses");
    }
  }

  return (
    <form onSubmit={submit} className={styles.form}>
      {mode === "signup" ? (
        <label>
          Name
          <input name="name" minLength={2} required />
        </label>
      ) : null}
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Password
        <input name="password" type="password" minLength={6} required />
      </label>
      {mode === "signup" ? (
        <>
          <label className={styles.checkboxLabel}>
            <span>Sign up as admin</span>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
          </label>
          {isAdmin && (
            <>
              <label>
                What type of courses will you create?
                <select name="courseType" required>
                  <option value="">Select</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label>
                Your experience level
                <select name="experienceLevel" required>
                  <option value="">Select</option>
                  <option value="beginner">Beginner (0-2 yrs)</option>
                  <option value="intermediate">Intermediate (2-5 yrs)</option>
                  <option value="expert">Expert (5+ yrs)</option>
                </select>
              </label>

              <label>
                What is your main goal as an admin?
                <textarea
                  name="adminGoal"
                  placeholder="e.g. Teach React, build structured courses, mentor learners"
                  required
                />
              </label>

              <label>
                Portfolio / LinkedIn / Website (optional)
                <input name="portfolio" type="url" placeholder="https://..." />
              </label>
            </>
          )}
        </>
      ) : null}
      {error ? <p className={styles.error}>{error}</p> : null}
      <button className={styles.primaryButton} disabled={loading}>
        {loading
          ? "Working..."
          : mode === "signup"
            ? "Create account"
            : "Login"}
      </button>
    </form>
  );
}
