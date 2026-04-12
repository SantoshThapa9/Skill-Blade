# Skill Blade

Skill Blade is a full-stack e-learning app built with Next.js App Router,
TypeScript, Sass Modules, MongoDB Atlas through Mongoose, cookie JWT auth,
course enrollment, progress tracking, quizzes, and PDF certificates.

## Setup

Create `.env.local` from `.env.local.example`:

```bash
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/skill_blade?retryWrites=true&w=majority
MONGODB_DB=skill_blade
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-secret
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_INVITE_CODE=change-this-admin-code
```

## Main Routes

- `/signup` and `/login` for auth
- `/courses` to browse and enroll
- `/courses/[courseId]/learn` for video lessons, quizzes, progress, certificates
- `/dashboard` for learners
- `/admin` for course, quiz, enrollment, and certificate oversight

## API Routes

- `/api/auth/signup`, `/api/auth/[...nextauth]`
- `/api/courses`, `/api/courses/[courseId]`
- `/api/enroll`
- `/api/quiz`
- `/api/progress`
- `/api/certificate`
- `/api/seed` can refresh the demo courses and quizzes, though the catalog also auto-seeds them

## Demo Data

Demo courses are inserted automatically when the course catalog or admin
dashboard loads. You can also trigger the idempotent seed endpoint manually:

```bash
curl http://localhost:3000/api/seed
```

The seed endpoint is idempotent and checks by course title before inserting.

## Admin Accounts

Choose `Admin` on signup and enter `ADMIN_INVITE_CODE`. If the code does not
match, the account is created as a normal user.

## Data Models

Mongoose models live in `src/models`: `User`, `Course`, `Quiz`, `Progress`,
and `Certificate`.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"# Skill-Blade" 
