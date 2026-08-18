"use client";

import Image from "next/image";
import { events as viewerEvents, Viewer, type Viewer as PhotoSphereViewer } from "@photo-sphere-viewer/core";
import { events as tourEvents, VirtualTourPlugin, type VirtualTourNode as PhotoSphereTourNode } from "@photo-sphere-viewer/virtual-tour-plugin";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Maximize2, Move3D, RotateCw, Route, Volume2, VolumeX, Watch } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { VirtualTourNode } from "@/types/location";

type PanoramaViewerProps = {
  src?: string;
  tour?: {
    startNodeId?: string;
    nodes: VirtualTourNode[];
  };
};

function toPhotoSphereNode(node: VirtualTourNode): PhotoSphereTourNode {
  return {
    id: node.id,
    name: node.name,
    caption: node.caption ?? node.name,
    description: node.description,
    panorama: node.panorama.url,
    thumbnail: node.thumbnail ?? node.panorama.url,
    links: node.links.map((link) => ({
      nodeId: link.nodeId,
      position: { yaw: link.yaw, pitch: link.pitch ?? -0.08 }
    })),
    data: { sourceNode: node }
  };
}

export function PanoramaViewer({ src, tour }: PanoramaViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PhotoSphereViewer | null>(null);
  const pluginRef = useRef<VirtualTourPlugin | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string>();
  const [viewerError, setViewerError] = useState("");
  const [isAutorotating, setIsAutorotating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const labelId = useId();
  const tourNodes = useMemo(() => tour?.nodes ?? [], [tour?.nodes]);
  const initialNodeId = tour?.startNodeId ?? tourNodes[0]?.id;
  const activeNodeId = tourNodes.some((node) => node.id === currentNodeId) ? currentNodeId : initialNodeId;
  const activeIndex = Math.max(0, tourNodes.findIndex((node) => node.id === activeNodeId));

  useEffect(() => {
    if (!ref.current) return;
    const container = ref.current;
    const nodes = tourNodes.map(toPhotoSphereNode);
    let viewer: PhotoSphereViewer | null = null;
    let virtualTour: VirtualTourPlugin | null = null;
    let disposed = false;
    setViewerError("");

    const onNodeChange = (event: tourEvents.NodeChangedEvent) => {
      if (!disposed) setCurrentNodeId(event.node.id);
    };
    const onFullscreen = (event: viewerEvents.FullscreenEvent) => {
      if (!disposed) setIsFullscreen(event.fullscreenEnabled);
    };

    const timer = window.setTimeout(() => {
      if (disposed) return;

      if (!supportsWebGL2()) {
        setViewerError("This browser or runtime does not support WebGL2, which is required for the 360-degree viewer.");
        return;
      }

      try {
        const hasTour = nodes.length > 0;
        viewer = new Viewer({
          container,
          panorama: hasTour ? undefined : src,
          navbar: false,
          caption: nodes[0]?.caption,
          mousewheel: true,
          defaultZoomLvl: 18,
          plugins: hasTour ? [
            VirtualTourPlugin.withConfig({
              positionMode: "manual",
              renderMode: "3d",
              preload: false,
              showLinkTooltip: true,
              arrowStyle: {
                className: "puja-tour-hotspot",
                size: { width: 74, height: 74 }
              },
              transitionOptions: { effect: "fade", rotation: true, speed: "12rpm" }
            })
          ] : []
        });

        viewerRef.current = viewer;
        viewer.addEventListener("fullscreen", onFullscreen);
        virtualTour = hasTour ? viewer.getPlugin<VirtualTourPlugin>(VirtualTourPlugin) : null;
        pluginRef.current = virtualTour;
        virtualTour?.addEventListener("node-changed", onNodeChange);
        virtualTour?.setNodes(nodes, tour?.startNodeId ?? nodes[0].id);
      } catch (error) {
        pluginRef.current = null;
        viewer?.destroy();
        viewer = null;
        if (!disposed) setViewerError(error instanceof Error ? error.message : "The 360-degree viewer could not be started.");
      }
    }, 0);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      setIsAutorotating(false);
      viewerRef.current = null;
      pluginRef.current = null;
      virtualTour?.removeEventListener("node-changed", onNodeChange);
      viewer?.removeEventListener("fullscreen", onFullscreen);
      viewer?.destroy();
    };
  }, [src, tour?.startNodeId, tourNodes]);

  useEffect(() => {
    if (!isAutorotating) return;
    const interval = window.setInterval(() => {
      const viewer = viewerRef.current;
      if (!viewer) return;
      const position = viewer.getPosition();
      void viewer.animate({ yaw: position.yaw + Math.PI / 3, pitch: position.pitch, speed: "4rpm" });
    }, 4500);
    return () => window.clearInterval(interval);
  }, [isAutorotating]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.classList.toggle("puja-tour-hide-hotspots", !showHotspots);
  }, [showHotspots]);

  function navigateToNode(nodeId?: string) {
    if (!nodeId) return;
    setCurrentNodeId(nodeId);
    void pluginRef.current?.setCurrentNode(nodeId);
  }

  function navigateByOffset(offset: number) {
    if (tourNodes.length === 0) return;
    const nextIndex = (activeIndex + offset + tourNodes.length) % tourNodes.length;
    navigateToNode(tourNodes[nextIndex]?.id);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-900 bg-slate-950 shadow-2xl shadow-slate-950/20">
      <div ref={ref} className="relative h-[min(760px,78vh)] min-h-[520px] bg-slate-950" aria-labelledby={labelId}>
        {viewerError && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <div className="max-w-md rounded-lg border border-slate-700 bg-slate-900 p-5 text-white">
              <p className="text-base font-semibold">360 viewer unavailable</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{viewerError}</p>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/80 via-black/20 to-transparent p-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div id={labelId} className="flex items-center gap-2 text-xs font-semibold uppercase text-amber-200">
                <Route className="h-4 w-4" />
                Immersive virtual tour
              </div>
              <p className="mt-1 text-lg font-semibold">{tourNodes[activeIndex]?.caption ?? tourNodes[activeIndex]?.name ?? "360 View"}</p>
            </div>
            <div className="rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs text-slate-200">
              {tourNodes.length > 0 ? `${activeIndex + 1} / ${tourNodes.length}` : "360"}
            </div>
          </div>
        </div>
        {tourNodes.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => navigateByOffset(-1)}
              className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-lg backdrop-blur transition hover:bg-black/70"
              aria-label="Previous scene"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              onClick={() => navigateByOffset(1)}
              className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-lg backdrop-blur transition hover:bg-black/70"
              aria-label="Next scene"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 text-white">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <TourControl active={isAutorotating} label={isAutorotating ? "Stop autorotation" : "Start autorotation"} onClick={() => setIsAutorotating((value) => !value)}>
                <RotateCw className="h-4 w-4" />
              </TourControl>
              <TourControl active={!isMuted} label={isMuted ? "Start sounds" : "Stop sounds"} onClick={() => setIsMuted((value) => !value)}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </TourControl>
              <TourControl active={showHotspots} label={showHotspots ? "Hide hotspots" : "Show hotspots"} onClick={() => setShowHotspots((value) => !value)}>
                {showHotspots ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </TourControl>
              <TourControl label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={() => viewerRef.current?.toggleFullscreen()}>
                <Maximize2 className="h-4 w-4" />
              </TourControl>
              <TourControl disabled label="Gyroscope requires device support">
                <Watch className="h-4 w-4" />
              </TourControl>
              <TourControl disabled label="VR mode requires a WebXR setup">
                <Move3D className="h-4 w-4" />
              </TourControl>
            </div>
            {tourNodes.length > 0 && (
              <div className="mx-auto flex max-w-full gap-2 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-2 backdrop-blur">
                {tourNodes.map((node, index) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => navigateToNode(node.id)}
                    className={`group relative h-16 w-28 shrink-0 overflow-hidden rounded-md border text-left transition ${
                      activeNodeId === node.id ? "border-amber-300" : "border-white/15 opacity-75 hover:opacity-100"
                    }`}
                    aria-pressed={activeNodeId === node.id}
                  >
                    <Image src={node.thumbnail ?? node.panorama.url} alt={node.panorama.alt ?? node.name} fill sizes="112px" className="object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1 pt-5 text-xs font-semibold text-white">
                      {index + 1}. {node.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 bg-slate-950 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-amber-200">
                <Route className="h-4 w-4" />
                Virtual tour pathway
              </div>
            <p className="mt-1 text-sm text-slate-300">Use the in-scene arrows, side controls, or thumbnails to walk through the route.</p>
            </div>
          {tourNodes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tourNodes.map((node, index) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => navigateToNode(node.id)}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                    activeNodeId === node.id
                      ? "border-amber-300 bg-amber-300 text-slate-950"
                      : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                  }`}
                  aria-pressed={activeNodeId === node.id}
                >
                  <span>{index + 1}. {node.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TourControl({ active, disabled, label, onClick, children }: { active?: boolean; disabled?: boolean; label: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full border text-white shadow-lg backdrop-blur transition ${
        active ? "border-amber-300 bg-amber-300/25" : "border-white/15 bg-black/45 hover:bg-black/70"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
    >
      {children}
    </button>
  );
}

function supportsWebGL2() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}
