"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import styles from "@/styles/App.module.scss";

type Lesson = { title: string; videoUrl: string; duration: number };
type QuizQuestion = { prompt: string; options: string[]; answerIndex: number };

type Course = {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
  quiz?: { questions: QuizQuestion[] };
};

const defaultLessons = [{ title: "Lesson 1", videoUrl: "", duration: 10 }];
const defaultQuiz = {
  questions: [
    {
      prompt: "What is the goal of this course?",
      options: ["Learn", "Skip", "Ignore", "Pause"],
      answerIndex: 0,
    },
  ],
};

export function AdminPanel() {
  const user = useAppSelector((state) => state.auth.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<Course | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    thumbnail: "",
    lessons: JSON.stringify(defaultLessons, null, 2),
    quiz: JSON.stringify(defaultQuiz, null, 2),
  });

  useEffect(() => {
    fetch("/api/courses")
      .then((response) => response.json())
      .then((data) => setCourses(data.courses || []));
  }, []);

  if (!user || user.role !== "admin") {
    return <p className={styles.error}>Admin access required.</p>;
  }

  function resetForm() {
    setEditing(null);
    setFormState({
      title: "",
      description: "",
      thumbnail: "",
      lessons: JSON.stringify(defaultLessons, null, 2),
      quiz: JSON.stringify(defaultQuiz, null, 2),
    });
  }

  async function saveCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Saving course…");

    const payload = {
      title: formState.title,
      description: formState.description,
      thumbnail: formState.thumbnail,
      lessons: JSON.parse(formState.lessons),
      quiz: { questions: JSON.parse(formState.quiz) },
    };

    const path = editing ? `/api/courses/${editing._id}` : "/api/courses";
    const response = await fetch(path, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage("Course saved.");
      resetForm();
      setCourses((current) => {
        if (editing) {
          return current.map((course) =>
            course._id === data.course._id ? data.course : course,
          );
        }
        return [...current, data.course];
      });
    } else {
      setMessage(data.error || "Unable to save course.");
    }
  }

  async function deleteCourse(courseId: string) {
    const response = await fetch(`/api/courses/${courseId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setCourses((current) =>
        current.filter((course) => course._id !== courseId),
      );
      setMessage("Course deleted.");
    } else {
      const data = await response.json();
      setMessage(data.error || "Delete failed.");
    }
  }

  function editCourse(course: Course) {
    setEditing(course);
    setFormState({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      lessons: JSON.stringify(course.lessons, null, 2),
      quiz: JSON.stringify(course.quiz ?? defaultQuiz, null, 2),
    });
  }

  return (
    <div className={styles.adminLayout}>
      <section className={styles.stack}>
        <h1>Admin</h1>
        {message ? <p className={styles.notice}>{message}</p> : null}

        <form className={styles.form} onSubmit={saveCourse}>
          <h2>{editing ? "Edit course" : "Create course"}</h2>
          <label>
            Title
            <input
              value={formState.title}
              onChange={(event) =>
                setFormState({ ...formState, title: event.target.value })
              }
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={formState.description}
              onChange={(event) =>
                setFormState({ ...formState, description: event.target.value })
              }
              required
            />
          </label>
          <label>
            Thumbnail URL
            <input
              value={formState.thumbnail}
              onChange={(event) =>
                setFormState({ ...formState, thumbnail: event.target.value })
              }
              required
            />
          </label>
          <label>
            Lessons JSON
            <textarea
              value={formState.lessons}
              onChange={(event) =>
                setFormState({ ...formState, lessons: event.target.value })
              }
              rows={8}
              required
            />
          </label>
          <label>
            Quiz JSON
            <textarea
              value={formState.quiz}
              onChange={(event) =>
                setFormState({ ...formState, quiz: event.target.value })
              }
              rows={8}
            />
          </label>
          <button className={styles.primaryButton} type="submit">
            Save course
          </button>
          {editing ? (
            <button type="button" onClick={resetForm}>
              Cancel edit
            </button>
          ) : null}
        </form>
      </section>

      <section className={styles.stack}>
        <h2>Published courses</h2>
        <div className={styles.list}>
          {courses.map((course) => (
            <article key={course._id}>
              <strong>{course.title}</strong>
              <span>{course.lessons.length} lessons</span>
              <button type="button" onClick={() => editCourse(course)}>
                Edit
              </button>
              <button type="button" onClick={() => deleteCourse(course._id)}>
                Delete
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
