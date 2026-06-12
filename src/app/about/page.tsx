"use client";
import styles from "@/styles/about.module.scss";

export default function AboutPage() {
  return (
    <main className={styles.aboutpage}>
      <section className={styles.hero}>
        <h1>About Skill Blade ⚔️</h1>
        <p>
          Skill Blade is a modern e-learning platform designed to provide
          structured, accessible, and skill-focused learning experiences. Built
          as a college group project, it focuses on helping learners gain
          practical knowledge through an intuitive and scalable web platform.
          built by santosh, navya and rajesh.
        </p>
      </section>

      <section className={styles.card}>
        <h2>🎯 Our Mission</h2>
        <p>
          To make learning more engaging, accessible, and effective by providing
          students with a platform that combines modern technology and
          structured educational content.
        </p>
      </section>

      <section className={styles.card}>
        <h2>🚀 Project Status</h2>
        <p>
          Skill Blade is currently under active development. New features,
          improvements, and optimizations are continuously being added to
          enhance the learning experience.
        </p>
      </section>

      <section className={styles.card}>
        <h2>🧩 Technology Stack</h2>
        <ul>
          <li>Next.js</li>
          <li>TypeScript</li>
          <li>SCSS (Sass)</li>
          <li>MongoDB</li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2>✨ Key Features</h2>
        <ul>
          <li>User Authentication (Login / Signup)</li>
          <li>Course Browsing & Enrollment</li>
          <li>Video-Based Learning Modules</li>
          <li>Progress Tracking</li>
          <li>Instructor Dashboard</li>
          <li>Responsive User Interface</li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2>📌 Academic Project</h2>
        <p>
          This platform is developed for academic and learning purposes.
          Features and architecture may evolve as the project progresses. The
          primary goal is to explore modern web development practices while
          creating a useful educational platform.
        </p>
      </section>
    </main>
  );
}
