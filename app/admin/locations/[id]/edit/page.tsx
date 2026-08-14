"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocationForm } from "@/components/admin/LocationForm";
import { Shell } from "@/components/Shell";
import { api } from "@/services/api";

export default function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-location", id], queryFn: () => api.adminLocation(id) });
  return (
    <Shell>
      <h1 className="mb-5 text-3xl font-semibold text-slate-950">Edit Location</h1>
      {isLoading && <p className="rounded-lg bg-white p-4">Loading location...</p>}
      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{(error as Error).message}</p>}
      {data && <LocationForm location={data} />}
    </Shell>
  );
}
