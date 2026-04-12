"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Certificate, Course, Progress, Quiz } from "@/lib/types";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data;
}

export type DashboardData = {
  user: { name: string; enrolledCourses: Course[] } | null;
  progress: Progress[];
  certificates: Certificate[];
};

export type AdminData = {
  courses: Course[];
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    enrolledCourses: Course[];
  }>;
};

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () =>
      parseResponse<{ courses: Course[] }>(await fetch("/api/courses")),
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["courses", courseId],
    queryFn: async () =>
      parseResponse<{ course: Course }>(await fetch(`/api/courses/${courseId}`)),
  });
}

export function useEnrollment(enabled: boolean) {
  return useQuery({
    queryKey: ["enrollment"],
    enabled,
    queryFn: async () =>
      parseResponse<DashboardData>(await fetch("/api/enroll")),
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["enrollment"],
    queryFn: async () =>
      parseResponse<DashboardData>(await fetch("/api/progress")),
  });
}

export function useQuiz(courseId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["quiz", courseId],
    enabled,
    queryFn: async () =>
      parseResponse<{ quiz: Quiz | null }>(
        await fetch(`/api/quiz?courseId=${courseId}`),
      ),
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin"],
    queryFn: async () => parseResponse<AdminData>(await fetch("/api/admin")),
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) =>
      parseResponse<{ progress: Progress }>(
        await fetch("/api/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
    },
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      lessonId,
    }: {
      courseId: string;
      lessonId: string;
    }) =>
      parseResponse<{ progress: Progress }>(
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, lessonId }),
        }),
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.courseId] });
    },
  });
}

export function useSubmitQuiz(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: number[]) =>
      parseResponse<{
        score: number;
        correct: number;
        total: number;
        progress: Progress;
      }>(
        await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, answers }),
        }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
    },
  });
}
