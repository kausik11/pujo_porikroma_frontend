import type { Metadata } from "next";
import { PujaTrailPlanner } from "@/components/trails/PujaTrailPlanner";

export const metadata: Metadata = {
  title: "Puja Trails | PujaWay",
  description: "Build a multi-stop Kolkata Durga Puja trail, compare travel modes, and open the route in Maps.",
};

export default function RoutePlannerPage() {
  return <PujaTrailPlanner />;
}
