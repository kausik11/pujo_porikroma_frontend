"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MapPinned, Search } from "lucide-react";
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
      <div className="mb-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#a77a22]">Explore Kolkata</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="max-w-3xl font-[var(--font-bengali-sans)] text-4xl font-medium leading-tight text-[#171612] sm:text-5xl">
              আপনার পুজো পরিক্রমা এখান থেকেই শুরু
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5b5548]">
              Search by Puja, area, city, or region and compare locations directly on the map.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8bd74] bg-[#fff4d9] px-4 py-2 text-sm font-semibold text-[#4c3510]">
            <MapPinned className="h-4 w-4" aria-hidden="true" />
            {isLoading ? "Loading..." : `${data.length} Puja${data.length === 1 ? "" : "s"}`}
          </div>
        </div>
      </div>

      <section className="mb-8 rounded-lg border border-[#ddc686] bg-[#fffaf0] p-4 shadow-[0_18px_45px_rgba(82,59,20,0.08)] sm:p-5" aria-label="Filter Pujas">
        <div className="flex flex-wrap gap-2">
          {regions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRegion(item)}
              className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${region === item ? "bg-[#171612] text-[#ffe49b] shadow-sm" : "border border-[#e2c980] bg-white text-[#4d4537] hover:border-[#b88a22]"}`}
            >
              {item === "ALL" ? "All" : item[0] + item.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr]">
          <label className="flex min-h-12 items-center gap-3 rounded-md border border-[#d7c083] bg-white px-4 text-[#5b5548] focus-within:border-[#171612]">
            <Search className="h-5 w-5 text-[#b88a22]" aria-hidden="true" />
            <span className="sr-only">Search Pujas</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pujas, clubs, areas..." className="w-full bg-transparent py-3 outline-none placeholder:text-[#8a8376]" />
          </label>
          <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" aria-label="Filter Pujas by city" className="min-h-12 rounded-md border border-[#d7c083] bg-white px-4 text-[#171612] outline-none placeholder:text-[#8a8376] focus:border-[#171612]" />
          <input value={state} onChange={(event) => setState(event.target.value)} placeholder="State" aria-label="Filter Pujas by state" className="min-h-12 rounded-md border border-[#d7c083] bg-white px-4 text-[#171612] outline-none placeholder:text-[#8a8376] focus:border-[#171612]" />
        </div>
      </section>

      {isLoading && <p className="rounded-lg border border-[#ddc686] bg-[#fffaf0] p-5 text-[#5b5548]">Loading Pujas...</p>}
      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">{(error as Error).message}</p>}
      {!isLoading && data.length === 0 && <p className="rounded-lg border border-[#ddc686] bg-[#fffaf0] p-5 text-[#5b5548]">No Pujas found.</p>}
      {data.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-lg border border-[#c9a953] bg-white shadow-[0_24px_60px_rgba(82,59,20,0.12)]">
          <DynamicOfficeMap offices={data} />
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data.map((office) => <OfficeCard key={office._id} office={office} />)}</div>
    </Shell>
  );
}

export default function LocationsPage() {
  return (
    <Suspense
      fallback={
        <Shell variant="public">
          <p className="rounded-lg border border-[#ddc686] bg-[#fffaf0] p-5 text-[#5b5548]">Loading Pujas...</p>
        </Shell>
      }
    >
      <LocationsContent />
    </Suspense>
  );
}
