"use client";

import { use, useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import Image from "next/image";

import styles from "@/styles/Course.module.scss";

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

type Course = {
  title: string;
  description: string;
  thumbnail?: string;
  lessons: Lesson[];
  quiz?: { questions: QuizQuestion[] };
};

type Progress = {
  watchedLessons: string[];
  quizCompleted: boolean;
};

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);

  return (
    <main className={styles.pageShell}>
      <section className={styles.contentSection}>
        <CourseDetail courseId={courseId} />
      </section>
    </main>
  );
}

function CourseDetail({ courseId }: { courseId: string }) {
  const user = useAppSelector((state) => state.auth.user);

  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [progress, setProgress] = useState<Progress>({
    watchedLessons: [],
    quizCompleted: false,
  });
  const [completed, setCompleted] = useState(false);

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
          setProgress(
            data?.progress || { watchedLessons: [], quizCompleted: false },
          );
          setCompleted(Boolean(data?.completed));
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

  async function markLessonWatched(lessonId: string) {
    const res = await fetch(`/api/courses/${courseId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });

    if (res.ok) {
      setProgress((prev) => ({
        ...prev,
        watchedLessons: [...prev.watchedLessons, lessonId],
      }));
      setMessage("Lesson marked as watched.");
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to mark lesson.");
    }
  }

  async function submitQuiz() {
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, answers }),
    });

    const data = await res.json();

    if (res.ok) {
      setScore(data.score);
      setProgress((prev) => ({ ...prev, quizCompleted: true }));
      if (data.completed) {
        setCompleted(true);
        setMessage(`Course completed! Score: ${data.score}%`);
      } else {
        setMessage(`Score: ${data.score}% - Need 70% to complete the course.`);
      }
    } else {
      setMessage(data.error || "Quiz failed.");
    }
  }

  if (loading) return <p className={styles.muted}>Loading...</p>;
  if (!course) return <p className={styles.error}>Course not found</p>;

  return (
    <div className={styles.detailLayout}>
      <section className={styles.stack}>
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
        {completed && <p className={styles.notice}>✅ Completed</p>}
        <p className={styles.description}>{course.description}</p>

        {!enrolled ? (
          <button className={styles.primaryButton} onClick={enroll}>
            {user ? "Enroll" : "Login to enroll"}
          </button>
        ) : (
          <p className={styles.notice}>Enrolled</p>
        )}

        {message && <p className={styles.notice}>{message}</p>}

        <div className={styles.section}>
          <h2>Lessons</h2>

          <div className={styles.lessonGrid}>
            {course.lessons.map((lesson, i) => {
              const lessonId = lesson._id || `lesson-${i}`;
              const isWatched = progress.watchedLessons.includes(lessonId);
              const isUnlocked =
                i === 0 ||
                progress.watchedLessons.includes(
                  course.lessons[i - 1]._id || `lesson-${i - 1}`,
                );

              return (
                <div
                  key={i}
                  className={`${styles.lessonCard} ${!isUnlocked ? styles.locked : ""}`}
                >
                  <h3>{lesson.title}</h3>
                  <p>{lesson.duration} min</p>

                  {lesson.videoUrl && isUnlocked && (
                    <div className={styles.videoWrapper}>
                      <iframe
                        src={lesson.videoUrl.replace("watch?v=", "embed/")}
                        title={lesson.title}
                        allowFullScreen
                      />
                      {!isWatched && (
                        <button
                          className={styles.primaryButton}
                          onClick={() => markLessonWatched(lessonId)}
                        >
                          Mark as Watched
                        </button>
                      )}
                      {isWatched && <p className={styles.notice}>✅ Watched</p>}
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className={styles.lockedOverlay}>
                      🔒 Complete previous lesson
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {course.quiz?.questions?.length &&
          enrolled &&
          progress.watchedLessons.length === course.lessons.length && (
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

        {enrolled && progress.watchedLessons.length < course.lessons.length && (
          <p className={styles.notice}>
            Complete all lessons to unlock the quiz.
          </p>
        )}
      </section>
    </div>
  );
}
