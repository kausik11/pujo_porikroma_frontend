"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LocateFixed, Route } from "lucide-react";
import { Shell } from "@/components/Shell";
import { DynamicOfficeMap } from "@/components/maps/DynamicOfficeMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/services/api";
import type { Coordinate } from "@/types/routing";

export default function MultiOfficeRoutePage() {
  const geo = useGeolocation();
  const [origin, setOrigin] = useState<Coordinate>({ lat: 22.5726, lng: 88.3639 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: offices = [] } = useQuery({ queryKey: ["locations"], queryFn: () => api.listLocations() });
  const mutation = useMutation({ mutationFn: () => api.multiOffice(origin, [...selected]) });

  return (
    <Shell variant="public">
      <h1 className="text-3xl font-semibold text-slate-950">Plan a Multi-Puja Visit</h1>
      <div className="mt-5 grid gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-2">
            <input value={origin.lat} onChange={(event) => setOrigin({ ...origin, lat: Number(event.target.value) })} className="rounded-md border px-3 py-2" />
            <input value={origin.lng} onChange={(event) => setOrigin({ ...origin, lng: Number(event.target.value) })} className="rounded-md border px-3 py-2" />
          </div>
          <button onClick={geo.requestLocation} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium"><LocateFixed className="h-4 w-4" /> Use My Location</button>
          {geo.position && <button onClick={() => setOrigin(geo.position!)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">Set Origin</button>}
          <div className="mt-4 max-h-[420px] space-y-2 overflow-auto">
            {offices.map((office) => (
              <label key={office._id} className="flex items-start gap-3 rounded-md border border-slate-200 p-3 text-sm">
                <input type="checkbox" checked={selected.has(office._id)} onChange={() => setSelected((prev) => { const next = new Set(prev); if (next.has(office._id)) next.delete(office._id); else next.add(office._id); return next; })} />
                <span>{office.title}<span className="block text-slate-500">{office.city}</span></span>
              </label>
            ))}
          </div>
          <button onClick={() => mutation.mutate()} disabled={selected.size === 0 || mutation.isPending} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"><Route className="h-4 w-4" /> Create Best Route</button>
        </aside>
        <div>
          <DynamicOfficeMap offices={offices.filter((office) => selected.has(office._id))} origin={origin} route={mutation.data?.route.coordinates} />
          {mutation.error && <p className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">{mutation.error.message}</p>}
          {mutation.data && <p className="mt-4 rounded-lg bg-white p-4">Route distance: {(mutation.data.route.distanceMeters / 1000).toFixed(1)} km. Duration: {Math.round(mutation.data.route.durationSeconds / 60)} min.</p>}
        </div>
      </div>
    </Shell>
  );
}
