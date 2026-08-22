"use client";

import { useQuery } from "@tanstack/react-query";
import { LocateFixed } from "lucide-react";
import { OfficeCard } from "@/components/OfficeCard";
import { Shell } from "@/components/Shell";
import { DynamicOfficeMap } from "@/components/maps/DynamicOfficeMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/services/api";

export default function NearMePage() {
  const geo = useGeolocation();
  const { data = [], isFetching, error } = useQuery({
    queryKey: ["nearby", geo.position],
    queryFn: () => api.nearby(geo.position!.lat, geo.position!.lng),
    enabled: Boolean(geo.position)
  });

  return (
    <Shell variant="public">
      <div className="mb-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#a77a22]">Near Me</p>
        <h1 className="max-w-3xl font-[var(--font-bengali-sans)] text-4xl font-medium leading-tight text-[#171612] sm:text-5xl">
          আপনার কাছাকাছি পুজোগুলো খুঁজুন
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#5b5548]">
          Use your current location to discover nearby pandals and open directions instantly.
        </p>
        <button onClick={geo.requestLocation} disabled={geo.loading} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#171612] px-5 py-2 text-sm font-semibold text-[#ffe49b] disabled:opacity-60">
          <LocateFixed className="h-4 w-4" /> {geo.loading ? "Reading location..." : "Use My Location"}
        </button>
        {geo.error && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{geo.error}</p>}
      </div>
      {isFetching && <p className="rounded-lg border border-[#ddc686] bg-[#fffaf0] p-5 text-[#5b5548]">Finding nearby Pujas...</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">{(error as Error).message}</p>}
      {geo.position && data.length > 0 && <div className="mb-8 overflow-hidden rounded-lg border border-[#c9a953] bg-white shadow-[0_24px_60px_rgba(82,59,20,0.12)]"><DynamicOfficeMap offices={data} center={geo.position} origin={geo.position} /></div>}
      {geo.position && !isFetching && data.length === 0 && <p className="rounded-lg border border-[#ddc686] bg-[#fffaf0] p-5 text-[#5b5548]">No nearby Pujas found.</p>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data.map((office) => <OfficeCard key={office._id} office={office} />)}</div>
    </Shell>
  );
}
