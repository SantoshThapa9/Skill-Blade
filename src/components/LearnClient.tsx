"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  useCompleteLesson,
  useCourse,
  useEnrollment,
  useEnrollCourse,
  useQuiz,
  useSubmitQuiz,
} from "@/hooks/useLearningQueries";
import { VideoPlayer } from "@/components/VideoPlayer";
import styles from "@/styles/App.module.scss";

type Props = {
  courseId: string;
};

export function LearnClient({ courseId }: Props) {
  const router = useRouter();
  const { data: courseData, isLoading } = useCourse(courseId);
  const enrollment = useEnrollment(true);
  const enrollCourse = useEnrollCourse();
  const completeLessonMutation = useCompleteLesson();
  const [answers, setAnswers] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  const course = courseData?.course;
  const enrolled = useMemo(
    () =>
      enrollment.data?.user?.enrolledCourses.some(
        (enrolledCourse) => enrolledCourse._id === courseId,
      ) ?? false,
    [courseId, enrollment.data],
  );
  const quizQuery = useQuiz(courseId, enrolled);
  const submitQuizMutation = useSubmitQuiz(courseId);
  const progress =
    enrollment.data?.progress.find((item) => item.courseId === courseId) ?? null;

  const completed = useMemo(
    () => new Set(progress?.completedLessons ?? []),
    [progress],
  );

  async function markLessonComplete(lessonId: string) {
    if (!enrolled) {
      setMessage("Enroll to track lesson progress.");
      return;
    }

    completeLessonMutation.mutate(
      { courseId, lessonId },
      {
        onError: (error) => setMessage(error.message),
      },
    );
  }

  async function enroll() {
    enrollCourse.mutate(courseId, {
      onSuccess: () => setMessage("Enrollment saved. Full content unlocked."),
      onError: (error) => {
        if (error.message === "Authentication required") {
          router.push("/login");
        } else {
          setMessage(error.message);
        }
      },
    });
  }

  async function submitQuiz() {
    if (!enrolled) {
      setMessage("Enroll to attempt the quiz.");
      return;
    }

    submitQuizMutation.mutate(answers, {
      onSuccess: (data) => setMessage(`Quiz score: ${data.score}%`),
      onError: (error) => setMessage(error.message),
    });
  }

  async function issueCertificate() {
    if (!enrolled) {
      setMessage("Enroll and complete the course before downloading a certificate.");
      return;
    }

    const response = await fetch("/api/certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error);
      return;
    }
    window.location.href = data.certificate.certificateUrl;
  }

  if (isLoading || !course) {
    return <p className={styles.muted}>Preparing course room...</p>;
  }

  const quiz = quizQuery.data?.quiz;

  return (
    <div className={styles.learnLayout}>
      <section className={styles.videoPanel}>
        <h1>{course.title}</h1>
        {!enrolled ? (
          <p className={styles.notice}>
            Preview is open. Enroll to unlock every lesson, quizzes, progress,
            and certificates.
          </p>
        ) : null}
        {course.lessons.map((lesson, index) => {
          const locked = index > 0 && !enrolled;
          return (
            <article key={lesson._id} className={styles.lessonBlock}>
              <div>
                <h3>{lesson.title}</h3>
                <p>
                  {lesson.duration} minutes {locked ? "Locked" : ""}
                </p>
              </div>
              {locked ? (
                <div className={styles.lockedVideo}>
                  <strong>Enroll to unlock this lesson.</strong>
                </div>
              ) : (
                <VideoPlayer title={lesson.title} videoUrl={lesson.videoUrl} />
              )}
              <button
                className={styles.primaryButton}
                onClick={() => markLessonComplete(lesson._id)}
                disabled={locked}
              >
                {completed.has(lesson._id) ? "Completed" : "Mark complete"}
              </button>
            </article>
          );
        })}
      </section>
      <aside className={styles.quizPanel}>
        {!enrolled ? (
          <button className={styles.primaryButton} onClick={enroll}>
            Enroll to unlock
          </button>
        ) : null}
        <h2>Course quiz</h2>
        {enrolled && quiz ? (
          quiz.questions.map((question, questionIndex) => (
            <fieldset key={question._id}>
              <legend>{question.prompt}</legend>
              {question.options.map((option, optionIndex) => (
                <label key={option}>
                  <input
                    type="radio"
                    name={question._id}
                    onChange={() => {
                      const next = [...answers];
                      next[questionIndex] = optionIndex;
                      setAnswers(next);
                    }}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ))
        ) : (
          <p>{enrolled ? "No quiz yet." : "Enroll to attempt quizzes."}</p>
        )}
        {enrolled && quiz ? <button onClick={submitQuiz}>Submit quiz</button> : null}
        <button className={styles.primaryButton} onClick={issueCertificate}>
          Download certificate
        </button>
        {message ? <p className={styles.notice}>{message}</p> : null}
      </aside>
    </div>
  );
}
