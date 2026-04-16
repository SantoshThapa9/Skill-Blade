"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/App.module.scss";
import { useAppSelector } from "@/redux/hooks";
import Image from "next/image";

type Lesson = {
  _id?: string;
  title: string;
  duration: number;
  videoUrl?: string;
};

type QuizQuestion = {
  prompt: string;
  options: string[];
  answerIndex?: number;
};

type CourseDetailProps = {
  courseId: string;
};

type Course = {
  title: string;
  description: string;
  thumbnail?: string;
  lessons: Lesson[];
  quiz?: { questions: QuizQuestion[] };
};

export function CourseDetail({ courseId }: CourseDetailProps) {
  const user = useAppSelector((state) => state.auth.user);

  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      setLoading(true);
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (!cancelled) {
          setCourse(data?.course || null);
          setEnrolled(Boolean(data?.enrolled));
        }
      } catch {
        if (!cancelled) {
          setCourse(null);
          setMessage("Failed to load course.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCourse();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  async function enroll() {
    if (!user) {
      setMessage("Login required.");
      return;
    }

    const res = await fetch("/api/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId }),
    });

    const data = await res.json();

    if (res.ok) {
      setEnrolled(true);
      setMessage("Enrolled successfully.");
    } else {
      setMessage(data.error || "Enroll failed.");
    }
  }

  async function submitQuiz() {
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId, answers }),
    });

    const data = await res.json();

    if (res.ok) {
      setScore(data.score);
      setMessage(`Score: ${data.score}%`);
    } else {
      setMessage(data.error || "Quiz failed.");
    }
  }

  if (loading) return <p className={styles.muted}>Loading...</p>;
  if (!course) return <p className={styles.error}>Course not found</p>;

  return (
    <div className={styles.detailLayout}>
      <section className={styles.stack}>
        {/* 🔥 Thumbnail Banner */}
        {course.thumbnail && (
          <div className={styles.banner}>
            <Image
              alt={course.title}
              src={course.thumbnail}
              height={300}
              width={800}
            />
          </div>
        )}

        <p className={styles.kicker}>{course.lessons.length} lessons</p>

        <h1>{course.title}</h1>
        <p className={styles.description}>{course.description}</p>

        {/* 🔥 Enroll */}
        {!enrolled ? (
          <button className={styles.primaryButton} onClick={enroll}>
            {user ? "Enroll" : "Login to enroll"}
          </button>
        ) : (
          <p className={styles.notice}>Enrolled</p>
        )}

        {message && <p className={styles.notice}>{message}</p>}

        {/* 🔥 Lessons */}
        <div className={styles.section}>
          <h2>Lessons</h2>

          <div className={styles.lessonGrid}>
            {course.lessons.map((lesson, i) => (
              <div key={i} className={styles.lessonCard}>
                <h3>{lesson.title}</h3>
                <p>{lesson.duration} min</p>

                {/* 🔥 Video */}
                {lesson.videoUrl && (
                  <div className={styles.videoWrapper}>
                    {enrolled ? (
                      <iframe
                        src={lesson.videoUrl.replace("watch?v=", "embed/")}
                        title={lesson.title}
                        allowFullScreen
                      />
                    ) : (
                      <div className={styles.locked}>🔒 Enroll to watch</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 Quiz */}
        {course.quiz?.questions?.length && enrolled && (
          <section className={styles.section}>
            <h2>Quiz</h2>

            {course.quiz.questions.map((q, i) => (
              <div key={i} className={styles.card}>
                <p>{q.prompt}</p>

                {q.options.map((opt, j) => (
                  <label key={j} className={styles.option}>
                    <input
                      type="radio"
                      name={`q-${i}`}
                      checked={answers[i] === j}
                      onChange={() => {
                        const next = [...answers];
                        next[i] = j;
                        setAnswers(next);
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ))}

            <button
              className={styles.primaryButton}
              onClick={submitQuiz}
              disabled={answers.length !== course.quiz.questions.length}
            >
              Submit Quiz
            </button>

            {score !== null && (
              <p className={styles.notice}>Latest Score: {score}%</p>
            )}
          </section>
        )}
      </section>
    </div>
  );
}
