import styles from "./puja-detail.module.css";

export default function LoadingPujaDetails() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading Puja details">
      <main className={styles.skeleton}>
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonCopy}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonPanel} />
          </div>
        </div>
      </main>
    </div>
  );
}
