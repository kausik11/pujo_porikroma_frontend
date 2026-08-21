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
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-950">Pujas Near You</h1>
        <button onClick={geo.requestLocation} disabled={geo.loading} className="mt-4 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          <LocateFixed className="h-4 w-4" /> {geo.loading ? "Reading location..." : "Use My Location"}
        </button>
        {geo.error && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{geo.error}</p>}
      </div>
      {isFetching && <p className="rounded-lg bg-white p-4">Finding nearby Pujas...</p>}
      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{(error as Error).message}</p>}
      {geo.position && data.length > 0 && <div className="mb-6"><DynamicOfficeMap offices={data} center={geo.position} origin={geo.position} /></div>}
      {geo.position && !isFetching && data.length === 0 && <p className="rounded-lg bg-white p-4">No nearby Pujas found.</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.map((office) => <OfficeCard key={office._id} office={office} />)}</div>
    </Shell>
  );
}
