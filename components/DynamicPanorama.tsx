"use client";

import dynamic from "next/dynamic";

export const DynamicPanorama = dynamic(() => import("./PanoramaViewer").then((mod) => mod.PanoramaViewer), {
  ssr: false,
  loading: () => <div className="h-[460px] rounded-lg bg-slate-200" />
});
