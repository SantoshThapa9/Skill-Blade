export const demoCourses = [
  {
    _id: "64f000000000000000000001",
    title: "Frontend Development with React",
    description:
      "Basics to advanced React: components, hooks, state, and routing.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    lessons: [
      {
        _id: "64f100000000000000000001",
        title: "Intro to React",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
        duration: 18,
      },
      {
        _id: "64f100000000000000000002",
        title: "Components & Props",
        videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk",
        duration: 22,
      },
      {
        _id: "64f100000000000000000003",
        title: "State & Hooks",
        videoUrl: "https://www.youtube.com/watch?v=TNhaISOUy6Q",
        duration: 24,
      },
      {
        _id: "64f100000000000000000004",
        title: "React Router",
        videoUrl: "https://www.youtube.com/watch?v=Ul3y1LXxzdU",
        duration: 20,
      },
    ],
    quiz: [
      {
        prompt: "What is a React component?",
        options: [
          "A reusable piece of UI",
          "A database table",
          "A CSS reset",
          "A server runtime",
        ],
        answerIndex: 0,
      },
      {
        prompt: "Which hook is commonly used for local component state?",
        options: ["useState", "useRouter", "useServer", "useTable"],
        answerIndex: 0,
      },
      {
        prompt: "Props are used to pass what into a component?",
        options: [
          "Data",
          "Compiled files",
          "Mongo indexes",
          "HTTP headers only",
        ],
        answerIndex: 0,
      },
      {
        prompt: "React Router helps with which concern?",
        options: [
          "Client-side routing",
          "Password hashing",
          "PDF export",
          "DNS",
        ],
        answerIndex: 0,
      },
      {
        prompt: "What should React state updates trigger?",
        options: [
          "A UI re-render",
          "A file deletion",
          "A schema migration",
          "A DNS lookup",
        ],
        answerIndex: 0,
      },
    ],
  },
  {
    _id: "64f000000000000000000002",
    title: "Full Stack Development with Next.js",
    description:
      "Build full-stack apps using Next.js, API routes, and MongoDB.",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    lessons: [
      {
        _id: "64f200000000000000000001",
        title: "Intro to Next.js",
        videoUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
        duration: 19,
      },
      {
        _id: "64f200000000000000000002",
        title: "App Router & Layouts",
        videoUrl: "https://www.youtube.com/watch?v=eO51VVCpTk0",
        duration: 23,
      },
      {
        _id: "64f200000000000000000003",
        title: "API Routes",
        videoUrl: "https://www.youtube.com/watch?v=vrR4MlB7nBI",
        duration: 21,
      },
      {
        _id: "64f200000000000000000004",
        title: "Full Stack Project",
        videoUrl: "https://www.youtube.com/watch?v=843nec-IvW0",
        duration: 28,
      },
    ],
    quiz: [
      {
        prompt: "Which Next.js directory is used by the App Router?",
        options: ["app", "views", "controllers", "public-api"],
        answerIndex: 0,
      },
      {
        prompt: "Route handlers are useful for building what?",
        options: [
          "API endpoints",
          "Image alt text",
          "CSS variables",
          "Git commits",
        ],
        answerIndex: 0,
      },
      {
        prompt: "What does MongoDB commonly store?",
        options: [
          "Documents",
          "Only PNG files",
          "CSS selectors",
          "Browser tabs",
        ],
        answerIndex: 0,
      },
      {
        prompt: "A layout in the App Router is best for what?",
        options: [
          "Shared UI around pages",
          "Hashing passwords only",
          "Deleting courses",
          "Replacing TypeScript",
        ],
        answerIndex: 0,
      },
      {
        prompt: "Next.js can combine frontend pages with what?",
        options: [
          "Server-side APIs",
          "Only static images",
          "Only Sass",
          "Only tests",
        ],
        answerIndex: 0,
      },
    ],
  },
];

export function getDemoCourses() {
  return demoCourses.map((demoCourse) => ({
    _id: demoCourse._id,
    title: demoCourse.title,
    description: demoCourse.description,
    thumbnail: demoCourse.thumbnail,
    lessons: demoCourse.lessons,
    quiz: {
      questions: demoCourse.quiz.map((question) => ({
        prompt: question.prompt,
        options: question.options,
        answerIndex: question.answerIndex,
      })),
    },
  }));
}

export function getDemoCourse(courseId: string) {
  return getDemoCourses().find((course) => course._id === courseId) ?? null;
}
