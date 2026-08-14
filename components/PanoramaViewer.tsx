"use client";

import { Viewer } from "@photo-sphere-viewer/core";
import { useEffect, useRef } from "react";

export function PanoramaViewer({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const viewer = new Viewer({
      container: ref.current,
      panorama: src,
      navbar: ["zoom", "move", "fullscreen"]
    });
    return () => viewer.destroy();
  }, [src]);

  return <div ref={ref} className="h-[420px] overflow-hidden rounded-lg border border-slate-200 bg-slate-900" />;
}
