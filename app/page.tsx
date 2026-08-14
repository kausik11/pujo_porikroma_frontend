import Link from "next/link";
import { Building2, LocateFixed, Map, Route } from "lucide-react";
import { Shell } from "@/components/Shell";

export default function Home() {
  const cards = [
    { href: "/locations/near-me", title: "Offices Near Me", text: "Find the closest office based on your current location.", icon: LocateFixed },
    { href: "/locations", title: "Browse All Offices", text: "Browse office locations by North, South, East, West or Central region.", icon: Building2 },
    { href: "/route-planner", title: "Offices Along My Route", text: "Find offices you can visit without making a large detour from your journey.", icon: Route },
    { href: "/multi-office-route", title: "Plan Multiple Office Visits", text: "Select several offices and create an efficient visiting route.", icon: Map }
  ];

  return (
    <Shell>
      <section className="grid gap-8 py-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">Find an Office</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Choose the easiest way to find us.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Office Location & Smart Routing System</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">Browse locations, find nearby offices, identify offices along your route, and create efficient multi-office visits.</p>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400">
              <Icon className="h-6 w-6 text-emerald-700" />
              <h2 className="mt-4 text-xl font-semibold text-slate-950">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
            </Link>
          );
        })}
      </section>
    </Shell>
  );
}
