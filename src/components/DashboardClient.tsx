"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import type { Progress } from "@/lib/types";
import { useDashboard } from "@/hooks/useLearningQueries";
import styles from "@/styles/App.module.scss";

export function DashboardClient() {
  const { data, isLoading } = useDashboard();

  const progressByCourse = useMemo(() => {
    const map = new Map<string, Progress>();
    data?.progress.forEach((item) => map.set(item.courseId, item));
    return map;
  }, [data]);

  if (isLoading || !data) {
    return <p className={styles.muted}>Loading your dashboard...</p>;
  }

  return (
    <div className={styles.stack}>
      <h1>Keep your edge, {data.user?.name}</h1>
      <div className={styles.courseGrid}>
        {data.user?.enrolledCourses.map((course) => {
          const progress = progressByCourse.get(course._id);
          const lessonTotal = course.lessons.length || 1;
          const percent = Math.round(
            ((progress?.completedLessons.length ?? 0) / lessonTotal) * 100,
          );
          return (
            <article className={styles.card} key={course._id}>
              <Image
                src={course.thumbnail}
                alt=""
                width={800}
                height={500}
                unoptimized
              />
              <h3>{course.title}</h3>
              <p>{percent}% lessons complete</p>
              <p>Quiz score: {progress?.score ?? 0}%</p>
              <Link href={`/courses/${course._id}/learn`}>Continue</Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
