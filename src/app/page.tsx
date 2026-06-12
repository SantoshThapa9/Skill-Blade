import Link from "next/link";
import styles from "@/styles/App.module.scss";

export default function Home() {
  return (
    <main className={styles.pageShell}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Skill Blade</p>

          <h1>Sharper courses for sharper careers.</h1>

          <p>
            Skill Blade helps you learn in-demand skills, enroll in expert-led
            courses, and earn certifications to advance your career.
          </p>

          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/courses">
              Browse Courses
            </Link>

            <Link href="/signup">Create Account</Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>Why Skill Blade?</p>
          <h2>Learn practical skills that employers value</h2>
        </div>

        <p className={styles.sectionText}>
          Whether you're starting your first career, switching industries, or
          upgrading your expertise, Skill Blade provides modern,
          industry-focused learning paths designed by professionals.
        </p>
      </section>

      {/* Statistics */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>15,000+</h3>
          <p>Active Learners</p>
        </div>

        <div className={styles.statCard}>
          <h3>250+</h3>
          <p>Professional Courses</p>
        </div>

        <div className={styles.statCard}>
          <h3>50+</h3>
          <p>Industry Experts</p>
        </div>

        <div className={styles.statCard}>
          <h3>98%</h3>
          <p>Student Satisfaction</p>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>Features</p>
          <h2>Everything you need to grow</h2>
        </div>

        <div className={styles.featureGrid}>
          <article className={styles.featureCard}>
            <h3>Expert Instructors</h3>
            <p>Learn directly from experienced professionals and mentors.</p>
          </article>

          <article className={styles.featureCard}>
            <h3>Hands-On Projects</h3>
            <p>
              Apply your knowledge through practical assignments and real-world
              projects.
            </p>
          </article>

          <article className={styles.featureCard}>
            <h3>Flexible Learning</h3>
            <p>Study anytime, anywhere with self-paced course access.</p>
          </article>

          <article className={styles.featureCard}>
            <h3>Certificates</h3>
            <p>Earn certificates that showcase your skills and achievements.</p>
          </article>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>Popular Categories</p>
          <h2>Explore trending skills</h2>
        </div>

        <div className={styles.categoryGrid}>
          <div className={styles.categoryCard}>Web Development</div>
          <div className={styles.categoryCard}>Data Science</div>
          <div className={styles.categoryCard}>Cyber Security</div>
          <div className={styles.categoryCard}>Cloud Computing</div>
          <div className={styles.categoryCard}>UI / UX Design</div>
          <div className={styles.categoryCard}>Artificial Intelligence</div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>Success Stories</p>
          <h2>What our learners say</h2>
        </div>

        <div className={styles.testimonialGrid}>
          <article className={styles.testimonialCard}>
            <p>
              "The web development track helped me land my first internship
              within three months."
            </p>
            <strong>— Rahul Sharma</strong>
          </article>

          <article className={styles.testimonialCard}>
            <p>
              "Excellent instructors and practical projects. Highly
              recommended."
            </p>
            <strong>— Priya Singh</strong>
          </article>

          <article className={styles.testimonialCard}>
            <p>
              "The certification gave my resume a significant boost during job
              applications."
            </p>
            <strong>— Arjun Patel</strong>
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Ready to unlock your potential?</h2>

        <p>
          Join thousands of learners building the skills needed for tomorrow's
          opportunities.
        </p>

        <Link className={styles.primaryButton} href="/signup">
          Start Learning Today
        </Link>
      </section>
    </main>
  );
}
