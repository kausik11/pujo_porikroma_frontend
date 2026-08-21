"use client";

import dynamic from "next/dynamic";
import styles from "@/app/route-planner/route-planner.module.css";

export const DynamicPujaTrailMap = dynamic(
  () => import("./PujaTrailMap").then((module) => module.PujaTrailMap),
  {
    ssr: false,
    loading: () => (
      <div className={styles.mapLoading} role="status">
        <span className={styles.loadingSpinner} aria-hidden="true" />
        Loading the trail map…
      </div>
    ),
  },
);
