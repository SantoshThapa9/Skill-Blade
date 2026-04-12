"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "@/styles/App.module.scss";

type Props = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const body =
      mode === "signup"
        ? {
            name: form.get("name"),
            email: form.get("email"),
            password: form.get("password"),
            role: form.get("role"),
            adminCode: form.get("adminCode"),
          }
        : { email: form.get("email"), password: form.get("password") };

    if (mode === "signup") {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        setError(data.error ?? "Signup failed");
        return;
      }
    }

    const result = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
        <input name="password" type="password" minLength={8} required />
      </label>
      {mode === "signup" ? (
        <div className={styles.inlineFields}>
          <label>
            Role
            <select name="role" defaultValue="user">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>
            Admin code
            <input name="adminCode" placeholder="Optional" />
          </label>
        </div>
      ) : null}
      {error ? <p className={styles.error}>{error}</p> : null}
      <button className={styles.primaryButton} disabled={loading}>
        {loading ? "Working..." : mode === "signup" ? "Create account" : "Login"}
      </button>
    </form>
  );
}
