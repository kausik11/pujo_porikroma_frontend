"use client";

import dynamic from "next/dynamic";

export const DynamicOfficeMap = dynamic(() => import("./OfficeMap").then((mod) => mod.OfficeMap), {
  ssr: false,
  loading: () => <div className="h-[360px] rounded-lg bg-slate-200" role="status" aria-label="Loading map" />
});
