"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import styles from "@/styles/App.module.scss";
import { getDemoCourses } from "@/lib/demoCourse";
import Image from "next/image";

type Lesson = { title: string };

type Course = {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
};

export function CourseList() {
  const user = useAppSelector((state) => state.auth.user);
  const [courses, setCourses] = useState<Course[]>(
    () => getDemoCourses() as Course[],
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setLoading(true);
      try {
        const response = await fetch("/api/courses");
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        const fetched = Array.isArray(data?.courses) ? data.courses : [];

        const demo = getDemoCourses();
        const byId = new Map<string, Course>(
          demo.map((course) => [course._id, course]),
        );
        for (const course of fetched) {
          const id = course?._id?.toString?.() ?? String(course?._id ?? "");
          if (!id) continue;
          byId.set(id, { ...course, _id: id });
        }

        if (!cancelled) setCourses(Array.from(byId.values()));
      } catch {
        if (!cancelled) {
          setCourses(getDemoCourses() as Course[]);
          setMessage("Showing demo courses (server data unavailable).");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCourses();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enroll(courseId: string) {
    if (!user) {
      setMessage("Please login to enroll.");
      return;
    }

    const response = await fetch("/api/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    setMessage(
      data.error ||
        (response.ok ? "Enrolled successfully." : "Enrollment failed."),
    );
  }

  if (loading && courses.length === 0) {
    return <p className={styles.muted}>Loading courses...</p>;
  }

  return (
    <>
      {message ? <p className={styles.notice}>{message}</p> : null}
      <div className={styles.courseGrid}>
        {courses.map((course) => (
          <article className={styles.card} key={course._id}>
            <div className={styles.thumbnailWrapper}>
              <Image
                src={course.thumbnail}
                alt={course.title}
                width={400}
                height={200}
                className={styles.thumbnail}
              />
            </div>
            <div className={styles.cardBody}>
              <p className={styles.kicker}>{course.lessons.length} lessons</p>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </div>
            <div className={styles.cardActions}>
              <button onClick={() => enroll(course._id)}>
                {user ? "Enroll" : "Login to enroll"}
              </button>
              <Link href={`/courses/${course._id}`}>View</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
