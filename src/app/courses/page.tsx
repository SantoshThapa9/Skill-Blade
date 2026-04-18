"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useAppSelector } from "@/redux/hooks";

import styles from "@/styles/Course.module.scss";

type Course = {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: { title: string }[];
};

export default function CoursesPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.courses)) {
          setCourses(data.courses);
        }
      })
      .catch(() => {
        setMessage("Unable to load courses.");
      });
  }, []);

  async function enroll(courseId: string) {
    if (!user) return setMessage("Login required");

    const res = await fetch("/api/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    const data = await res.json();
    setMessage(data.error || (res.ok ? "Enrolled" : "Failed"));
  }

  return (
    <main className={styles.pageShell}>
      <section className={styles.contentSection}>
        <h1>Courses</h1>
        {message && <p className={styles.notice}>{message}</p>}

        <div className={styles.courseGrid}>
          {courses.map((c) => (
            <div key={c._id} className={styles.card}>
              <Image src={c.thumbnail} alt={c.title} width={400} height={200} />

              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <p>{c.lessons.length} lessons</p>

              <button
                className={styles.primaryButton}
                onClick={() => enroll(c._id)}
              >
                {user ? "Enroll" : "Login"}
              </button>

              <Link href={`/courses/${c._id}`} className={styles.muted}>
                View
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
