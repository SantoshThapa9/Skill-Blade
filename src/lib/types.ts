export type Role = "user" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Lesson = {
  _id: string;
  title: string;
  videoUrl: string;
  duration: number;
};

export type Course = {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
};

export type QuizQuestion = {
  _id: string;
  prompt: string;
  options: string[];
};

export type Quiz = {
  _id: string;
  courseId: string;
  questions: QuizQuestion[];
};

export type Progress = {
  _id: string;
  userId: string;
  courseId: string;
  completedLessons: string[];
  score: number;
};

export type Certificate = {
  _id: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  certificateUrl: string;
};
