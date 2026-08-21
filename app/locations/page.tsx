"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { OfficeCard } from "@/components/OfficeCard";
import { Shell } from "@/components/Shell";
import { DynamicOfficeMap } from "@/components/maps/DynamicOfficeMap";
import { api } from "@/services/api";

const regions = ["ALL", "NORTH", "SOUTH", "EAST", "WEST", "CENTRAL"] as const;

function LocationsContent() {
  const searchParams = useSearchParams();
  const [region, setRegion] = useState<(typeof regions)[number]>("ALL");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (region !== "ALL") params.set("region", region);
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (state) params.set("state", state);
    return params.size ? `?${params}` : "";
  }, [region, search, city, state]);
  const { data = [], isLoading, error } = useQuery({ queryKey: ["locations", query], queryFn: () => api.listLocations(query) });

  return (
    <Shell variant="public">
      <div className="mb-6 flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-slate-950">Explore Pujas</h1>
        <div className="flex flex-wrap gap-2">
          {regions.map((item) => (
            <button key={item} onClick={() => setRegion(item)} className={`rounded-md px-3 py-2 text-sm font-medium ${region === item ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>
              {item === "ALL" ? "All" : item[0] + item.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pujas..." aria-label="Search Pujas" className="rounded-md border border-slate-300 px-3 py-2" />
          <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" aria-label="Filter Pujas by city" className="rounded-md border border-slate-300 px-3 py-2" />
          <input value={state} onChange={(event) => setState(event.target.value)} placeholder="State" aria-label="Filter Pujas by state" className="rounded-md border border-slate-300 px-3 py-2" />
        </div>
      </div>
      {isLoading && <p className="rounded-lg bg-white p-4">Loading Pujas...</p>}
      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{(error as Error).message}</p>}
      {!isLoading && data.length === 0 && <p className="rounded-lg bg-white p-4">No Pujas found.</p>}
      {data.length > 0 && <div className="mb-6"><DynamicOfficeMap offices={data} /></div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.map((office) => <OfficeCard key={office._id} office={office} />)}</div>
    </Shell>
  );
}

export default function LocationsPage() {
  return (
    <Suspense
      fallback={
        <Shell variant="public">
          <p className="rounded-lg bg-white p-4">Loading Pujas...</p>
        </Shell>
      }
    >
      <LocationsContent />
    </Suspense>
  );
}
