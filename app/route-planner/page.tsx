"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LocateFixed, Route } from "lucide-react";
import { Shell } from "@/components/Shell";
import { DynamicOfficeMap } from "@/components/maps/DynamicOfficeMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/services/api";
import type { Coordinate } from "@/types/routing";

export default function RoutePlannerPage() {
  const geo = useGeolocation();
  const [origin, setOrigin] = useState<Coordinate>({ lat: 22.5726, lng: 88.3639 });
  const [destination, setDestination] = useState<Coordinate>({ lat: 22.642, lng: 88.42 });
  const [maxDetour, setMaxDetour] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const mutation = useMutation({
    mutationFn: () => api.alongRoute(origin, destination, maxDetour),
    onSuccess: (data) => setSelected(new Set(data.offices.map((office) => office.id)))
  });

  const officeMarkers = mutation.data?.offices.map((office) => ({
    _id: office.id,
    title: `${office.order}. ${office.title}`,
    slug: office.slug,
    fullAddress: office.fullAddress,
    city: "",
    state: "",
    country: "",
    region: "CENTRAL" as const,
    description: "",
    photos: [],
    active: true,
    location: { type: "Point" as const, coordinates: [office.location.lng, office.location.lat] as [number, number] }
  })) ?? [];

  return (
    <Shell variant="public">
      <h1 className="text-3xl font-semibold text-slate-950">Pujas Along My Route</h1>
      <div className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 lg:grid-cols-5">
        <label className="text-sm font-medium">From lat<input value={origin.lat} onChange={(event) => setOrigin({ ...origin, lat: Number(event.target.value) })} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
        <label className="text-sm font-medium">From lng<input value={origin.lng} onChange={(event) => setOrigin({ ...origin, lng: Number(event.target.value) })} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
        <label className="text-sm font-medium">To lat<input value={destination.lat} onChange={(event) => setDestination({ ...destination, lat: Number(event.target.value) })} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
        <label className="text-sm font-medium">To lng<input value={destination.lng} onChange={(event) => setDestination({ ...destination, lng: Number(event.target.value) })} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
        <label className="text-sm font-medium">Maximum detour<select value={maxDetour} onChange={(event) => setMaxDetour(Number(event.target.value))} className="mt-1 w-full rounded-md border px-3 py-2"><option>5</option><option>10</option><option>15</option></select></label>
        <button onClick={geo.requestLocation} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium"><LocateFixed className="h-4 w-4" /> Use My Location</button>
        {geo.position && <button onClick={() => setOrigin(geo.position!)} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">Set Origin</button>}
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"><Route className="h-4 w-4" aria-hidden="true" /> Find Pujas Along My Route</button>
      </div>
      <div className="mt-6"><DynamicOfficeMap offices={officeMarkers} origin={origin} destination={destination} route={mutation.data?.baseRoute.coordinates} onMapClick={setDestination} /></div>
      {geo.error && <p className="mt-4 rounded-lg bg-amber-50 p-4 text-amber-800">{geo.error}</p>}
      {mutation.error && <p className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">{mutation.error.message}</p>}
      {mutation.data && mutation.data.offices.length === 0 && <p className="mt-4 rounded-lg bg-white p-4">No Pujas were found within this route corridor. Try increasing the maximum detour.</p>}
      {mutation.data && mutation.data.offices.length > 0 && (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-xl font-semibold">Pujas Along Your Route</h2>
          <div className="mt-4 space-y-3">
            {mutation.data.offices.map((office) => (
              <label key={office.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                <span><input type="checkbox" checked={selected.has(office.id)} onChange={() => setSelected((prev) => { const next = new Set(prev); if (next.has(office.id)) next.delete(office.id); else next.add(office.id); return next; })} className="mr-3" />{office.order}. {office.title}</span>
                <span className="text-sm text-emerald-700">+{office.detourMinutes} min</span>
              </label>
            ))}
          </div>
        </section>
      )}
    </Shell>
  );
}
