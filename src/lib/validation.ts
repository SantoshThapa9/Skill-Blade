import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["user", "admin"]).optional(),
  adminCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const lessonSchema = z.object({
  title: z.string().min(2),
  videoUrl: z.string().url(),
  duration: z.number().min(1),
});

export const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  thumbnail: z.string().url(),
  lessons: z.array(lessonSchema).min(1),
});

export const quizQuestionSchema = z.object({
  prompt: z.string().min(4),
  options: z.array(z.string().min(1)).length(4),
  answerIndex: z.number().int().min(0).max(3),
});

export const quizSchema = z.object({
  courseId: z.string().min(1),
  questions: z.array(quizQuestionSchema).min(1),
});

export const enrollSchema = z.object({
  courseId: z.string().min(1),
});

export const progressSchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().optional(),
  score: z.number().min(0).max(100).optional(),
});

export const quizSubmitSchema = z.object({
  courseId: z.string().min(1),
  answers: z.array(z.number().int().min(0).max(3)),
});
