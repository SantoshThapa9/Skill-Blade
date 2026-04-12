"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useCourses, useEnrollCourse } from "@/hooks/useLearningQueries";
import styles from "@/styles/App.module.scss";

export function CourseBrowser() {
  const router = useRouter();
  const { status } = useSession();
  const { data, isLoading } = useCourses();
  const enrollCourse = useEnrollCourse();
  const [message, setMessage] = useState("");

  async function enroll(courseId: string) {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    enrollCourse.mutate(courseId, {
      onSuccess: () => setMessage("Enrollment saved."),
      onError: (error) => setMessage(error.message),
    });
  }

  if (isLoading) return <p className={styles.muted}>Loading courses...</p>;

  return (
    <>
      {message ? <p className={styles.notice}>{message}</p> : null}
      <div className={styles.courseGrid}>
        {(data?.courses ?? []).map((course) => (
          <article className={styles.card} key={course._id}>
            <Image
              src={course.thumbnail}
              alt=""
              width={800}
              height={500}
              unoptimized
            />
            <div>
              <p className={styles.kicker}>{course.lessons.length} lessons</p>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </div>
            <div className={styles.cardActions}>
              <button onClick={() => enroll(course._id)}>
                {status === "authenticated" ? "Enroll" : "Login to enroll"}
              </button>
              <Link href={`/courses/${course._id}`}>Open</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
