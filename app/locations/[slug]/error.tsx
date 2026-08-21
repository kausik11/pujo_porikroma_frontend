"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./puja-detail.module.css";

export default function PujaDetailsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={styles.statePage}>
      <section className={styles.stateCard} aria-labelledby="puja-error-title">
        <h1 id="puja-error-title">We couldn&apos;t load this Puja</h1>
        <p>The PujaWay service may be temporarily unavailable. Try again or return to explore other pandals.</p>
        <div className={styles.stateActions}>
          <button type="button" onClick={() => retry()}>
            Try again
          </button>
          <Link href="/#explore">Explore Pujas</Link>
        </div>
      </section>
    </main>
  );
}
