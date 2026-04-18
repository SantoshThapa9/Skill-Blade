"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import styles from "@/styles/Admin.module.scss";

type Lesson = { title: string; videoUrl: string; duration: number };
type QuizQuestion = { prompt: string; options: string[]; answerIndex: number };

type Course = {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
  quiz: { questions: QuizQuestion[] };
  createdBy: string;
  createdByName: string;
};

type FormState = {
  title: string;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
};

const initialFormState: FormState = {
  title: "",
  description: "",
  thumbnail: "",
  lessons: [{ title: "", videoUrl: "", duration: 0 }],
  quiz: Array.from({ length: 5 }, () => ({
    prompt: "",
    options: ["", "", "", ""],
    answerIndex: 0,
  })),
};

export default function AdminPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [view, setView] = useState<"create" | "manage">("manage");
  const [editing, setEditing] = useState<Course | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(initialFormState);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch(() => setMessage("Unable to load courses."));
  }, []);

  if (!user || user.role !== "admin") {
    return <p>Admin access required</p>;
  }

  function resetForm() {
    setEditing(null);
    setFormState(initialFormState);
  }

  function startCreate() {
    resetForm();
    setView("create");
    setMessage(null);
  }

  function startManage() {
    resetForm();
    setView("manage");
    setMessage(null);
  }

  function populateForm(course: Course) {
    setEditing(course);
    setFormState({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      lessons: course.lessons.length
        ? course.lessons
        : initialFormState.lessons,
      quiz: course.quiz.questions.length
        ? course.quiz.questions
        : initialFormState.quiz,
    });
    setView("create");
  }

  async function saveCourse(e: FormEvent) {
    e.preventDefault();
    setMessage("Saving...");

    const payload = {
      title: formState.title,
      description: formState.description,
      thumbnail: formState.thumbnail,
      lessons: formState.lessons,
      quiz: { questions: formState.quiz },
      ...(editing ? { _id: editing._id } : {}),
    };

    const res = await fetch("/api/courses", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(editing ? "Course updated." : "Course created.");
      setCourses((prev) =>
        editing
          ? prev.map((course) =>
              course._id === data.course._id ? data.course : course,
            )
          : [...prev, data.course],
      );
      resetForm();
      setView("manage");
    } else {
      setMessage(data.error || "Unable to save course.");
    }
  }

  async function deleteCourse(courseId: string) {
    if (!confirm("Delete this course? This cannot be undone.")) {
      return;
    }

    const res = await fetch(`/api/courses/${courseId}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (res.ok) {
      setCourses((prev) => prev.filter((course) => course._id !== courseId));
      setMessage("Course deleted.");
      if (editing?._id === courseId) {
        resetForm();
      }
    } else {
      setMessage(data.error || "Unable to delete course.");
    }
  }

  const ownedCourse = (course: Course) => course.createdBy === user.id;

  return (
    <main className={styles.pageShell}>
      <section className={styles.contentSection}>
        <div className={styles.adminTabs}>
          <button
            type="button"
            className={view === "create" ? styles.activeTab : ""}
            onClick={startCreate}
          >
            Create new course
          </button>
          <button
            type="button"
            className={view === "manage" ? styles.activeTab : ""}
            onClick={startManage}
          >
            Manage courses
          </button>
        </div>

        {view === "create" ? (
          <form onSubmit={saveCourse} className={styles.adminForm}>
            <h2>{editing ? "Edit course" : "Create course"}</h2>

            <label>
              Title
              <input
                required
                value={formState.title}
                onChange={(e) =>
                  setFormState({ ...formState, title: e.target.value })
                }
              />
            </label>

            <label>
              Description
              <textarea
                required
                value={formState.description}
                onChange={(e) =>
                  setFormState({ ...formState, description: e.target.value })
                }
              />
            </label>

            <label>
              Thumbnail URL
              <input
                required
                value={formState.thumbnail}
                onChange={(e) =>
                  setFormState({ ...formState, thumbnail: e.target.value })
                }
              />
            </label>

            <section>
              <h3>Lessons</h3>
              {formState.lessons.map((lesson, index) => (
                <div key={index} className={styles.lessonRow}>
                  <input
                    required
                    placeholder="Lesson title"
                    value={lesson.title}
                    onChange={(e) => {
                      const lessons = [...formState.lessons];
                      lessons[index].title = e.target.value;
                      setFormState({ ...formState, lessons });
                    }}
                  />
                  <input
                    required
                    placeholder="Video URL"
                    value={lesson.videoUrl}
                    onChange={(e) => {
                      const lessons = [...formState.lessons];
                      lessons[index].videoUrl = e.target.value;
                      setFormState({ ...formState, lessons });
                    }}
                  />
                  <input
                    required
                    type="number"
                    min={1}
                    placeholder="Duration"
                    value={lesson.duration}
                    onChange={(e) => {
                      const lessons = [...formState.lessons];
                      lessons[index].duration = Number(e.target.value);
                      setFormState({ ...formState, lessons });
                    }}
                  />
                  <button
                    type="button"
                    disabled={formState.lessons.length === 1}
                    onClick={() => {
                      const lessons = formState.lessons.filter(
                        (_, lessonIndex) => lessonIndex !== index,
                      );
                      setFormState({ ...formState, lessons });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFormState({
                    ...formState,
                    lessons: [
                      ...formState.lessons,
                      { title: "", videoUrl: "", duration: 0 },
                    ],
                  })
                }
              >
                Add lesson
              </button>
            </section>

            <section>
              <h3>Quiz</h3>
              {formState.quiz.map((question, qi) => (
                <div key={qi} className={styles.quizRow}>
                  <input
                    required
                    placeholder={`Question ${qi + 1}`}
                    value={question.prompt}
                    onChange={(e) => {
                      const quiz = [...formState.quiz];
                      quiz[qi].prompt = e.target.value;
                      setFormState({ ...formState, quiz });
                    }}
                  />
                  {question.options.map((option, oi) => (
                    <div key={oi} className={styles.quizOption}>
                      <input
                        required
                        placeholder={`Option ${oi + 1}`}
                        value={option}
                        onChange={(e) => {
                          const quiz = [...formState.quiz];
                          quiz[qi].options[oi] = e.target.value;
                          setFormState({ ...formState, quiz });
                        }}
                      />
                      <label>
                        <input
                          type="radio"
                          name={`answer-${qi}`}
                          checked={question.answerIndex === oi}
                          onChange={() => {
                            const quiz = [...formState.quiz];
                            quiz[qi].answerIndex = oi;
                            setFormState({ ...formState, quiz });
                          }}
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </section>

            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryButton}>
                {editing ? "Update course" : "Create course"}
              </button>
              {editing && (
                <button type="button" onClick={resetForm}>
                  Cancel edit
                </button>
              )}
            </div>

            {message && <p className={styles.notice}>{message}</p>}
          </form>
        ) : (
          <div className={styles.manageSection}>
            <h2>Manage courses</h2>
            {courses.length === 0 ? (
              <p>No courses available.</p>
            ) : (
              courses.map((course) => (
                <div key={course._id} className={styles.manageCard}>
                  <div>
                    <strong>{course.title}</strong>
                    <p>{course.description}</p>
                    <p className={styles.meta}>
                      Created by {course.createdByName || "Unknown"}
                    </p>
                  </div>
                  <div className={styles.manageActions}>
                    {ownedCourse(course) ? (
                      <>
                        <button
                          type="button"
                          onClick={() => populateForm(course)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCourse(course._id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className={styles.locked}>
                        Only the creator can edit or delete
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            {message && <p className={styles.notice}>{message}</p>}
          </div>
        )}
      </section>
    </main>
  );
}
