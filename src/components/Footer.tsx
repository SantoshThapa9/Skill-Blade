import styles from "@/styles/Footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p>Skill Blade © {new Date().getFullYear()}</p>
        <p>Learn, build, and grow with confidence.</p>
      </div>
    </footer>
  );
}
