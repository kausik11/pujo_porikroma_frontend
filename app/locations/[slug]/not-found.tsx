import Link from "next/link";
import styles from "./puja-detail.module.css";

export default function PujaNotFound() {
  return (
    <main className={styles.statePage}>
      <section className={styles.stateCard} aria-labelledby="puja-not-found-title">
        <h1 id="puja-not-found-title">Puja not found</h1>
        <p>This pandal may no longer be listed, or the address you followed may be incorrect.</p>
        <div className={styles.stateActions}>
          <Link href="/#explore">Explore Pujas</Link>
          <Link href="/locations">Browse all Pujas</Link>
        </div>
      </section>
    </main>
  );
}
