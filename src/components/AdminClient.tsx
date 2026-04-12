"use client";

import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Course } from "@/lib/types";
import { useAdminDashboard } from "@/hooks/useLearningQueries";
import styles from "@/styles/App.module.scss";

const sampleLessons = JSON.stringify(
  [
    {
      title: "Foundation lesson",
      videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      duration: 12,
    },
  ],
  null,
  2,
);

const sampleQuestions = JSON.stringify(
  [
    {
      prompt: "What is the main outcome of this course?",
      options: ["Practice", "Guessing", "Skipping", "Waiting"],
      answerIndex: 0,
    },
  ],
  null,
  2,
);

export function AdminClient() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminDashboard();
  const [editing, setEditing] = useState<Course | null>(null);
  const [message, setMessage] = useState("");

  async function saveCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Saving course...");
    const form = new FormData(event.currentTarget);
    const body = {
      title: form.get("title"),
      description: form.get("description"),
      thumbnail: form.get("thumbnail"),
      lessons: JSON.parse(String(form.get("lessons"))),
    };
    const response = await fetch(
      editing ? `/api/courses/${editing._id}` : "/api/courses",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    setMessage(response.ok ? "Course saved." : "Course save failed.");
    setEditing(null);
    event.currentTarget.reset();
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["courses"] });
  }

  async function saveQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/quiz", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: form.get("courseId"),
        questions: JSON.parse(String(form.get("questions"))),
      }),
    });
    setMessage(response.ok ? "Quiz saved." : "Quiz save failed.");
  }

  async function removeCourse(courseId: string) {
    await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["courses"] });
  }

  if (isLoading || !data) {
    return <p className={styles.muted}>Loading admin dashboard...</p>;
  }

  return (
    <div className={styles.adminLayout}>
      <section className={styles.stack}>
        <h1>Admin dashboard</h1>
        {message ? <p className={styles.notice}>{message}</p> : null}
        <form className={styles.form} onSubmit={saveCourse}>
          <h2>{editing ? "Edit course" : "Create course"}</h2>
          <label>
            Title
            <input name="title" defaultValue={editing?.title} required />
          </label>
          <label>
            Description
            <textarea
              name="description"
              defaultValue={editing?.description}
              required
            />
          </label>
          <label>
            Thumbnail URL
            <input
              name="thumbnail"
              defaultValue={
                editing?.thumbnail ??
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
              }
              required
            />
          </label>
          <label>
            Lessons JSON
            <textarea
              name="lessons"
              defaultValue={
                editing ? JSON.stringify(editing.lessons, null, 2) : sampleLessons
              }
              rows={8}
              required
            />
          </label>
          <button className={styles.primaryButton}>Save course</button>
        </form>
        <form className={styles.form} onSubmit={saveQuiz}>
          <h2>Create quiz</h2>
          <label>
            Course
            <select name="courseId" required>
              {data.courses.map((course) => (
                <option value={course._id} key={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Questions JSON
            <textarea name="questions" defaultValue={sampleQuestions} rows={8} />
          </label>
          <button>Save quiz</button>
        </form>
      </section>
      <section className={styles.stack}>
        <h2>Courses</h2>
        <div className={styles.list}>
          {data.courses.map((course) => (
            <article key={course._id}>
              <strong>{course.title}</strong>
              <span>{course.lessons.length} lessons</span>
              <button onClick={() => setEditing(course)}>Edit</button>
              <button onClick={() => removeCourse(course._id)}>Delete</button>
            </article>
          ))}
        </div>
        <h2>Enrolled users</h2>
        <div className={styles.list}>
          {data.users.map((user) => (
            <article key={user._id}>
              <strong>
                {user.name} ({user.role})
              </strong>
              <span>{user.email}</span>
              <small>
                {user.enrolledCourses.map((course) => course.title).join(", ") ||
                  "No enrollments"}
              </small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
