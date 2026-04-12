"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import {
  useCourse,
  useEnrollment,
  useEnrollCourse,
} from "@/hooks/useLearningQueries";
import { VideoPlayer } from "@/components/VideoPlayer";
import styles from "@/styles/App.module.scss";

export function CourseDetailClient({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { status } = useSession();
  const { data, isLoading } = useCourse(courseId);
  const enrollment = useEnrollment(status === "authenticated");
  const enrollCourse = useEnrollCourse();
  const [message, setMessage] = useState("");

  const course = data?.course;
  const enrolled = useMemo(
    () =>
      enrollment.data?.user?.enrolledCourses.some(
        (enrolledCourse) => enrolledCourse._id === courseId,
      ) ?? false,
    [courseId, enrollment.data],
  );

  async function enroll() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    enrollCourse.mutate(courseId, {
      onSuccess: () => setMessage("Enrollment saved."),
      onError: (error) => setMessage(error.message),
    });
  }

  if (isLoading || !course) return <p className={styles.muted}>Loading course...</p>;

  return (
    <div className={styles.detailLayout}>
      <Image
        src={course.thumbnail}
        alt=""
        width={1000}
        height={700}
        unoptimized
      />
      <section className={styles.stack}>
        <p className={styles.kicker}>{course.lessons.length} lessons</p>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className={styles.cardActions}>
          <button className={styles.primaryButton} onClick={enroll}>
            {status === "authenticated" ? "Enroll" : "Login to enroll"}
          </button>
          <Link href={`/courses/${courseId}/learn`}>Start learning</Link>
        </div>
        {message ? <p className={styles.notice}>{message}</p> : null}
        {course.lessons[0] ? (
          <article className={styles.lessonBlock}>
            <div>
              <h3>Preview: {course.lessons[0].title}</h3>
              <p>{course.lessons[0].duration} minutes</p>
            </div>
            <VideoPlayer
              title={course.lessons[0].title}
              videoUrl={course.lessons[0].videoUrl}
            />
          </article>
        ) : null}
        <div className={styles.list}>
          {course.lessons.map((lesson, index) => (
            <article key={lesson._id}>
              <strong>{lesson.title}</strong>
              <span>{lesson.duration} minutes</span>
              <small>{index === 0 || enrolled ? "Available" : "Locked"}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
