"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Shell } from "@/components/Shell";
import { api } from "@/services/api";

export default function AdminLocationsPage() {
  const client = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin-locations"], queryFn: api.adminLocations });
  const remove = useMutation({
    mutationFn: api.deleteLocation,
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-locations"] })
  });

  return (
    <Shell>
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Pujas</h1>
          <p className="mt-2 text-sm text-slate-600">Create, edit, preview, and remove Puja listings.</p>
        </div>
        <Link href="/admin/locations/new" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" aria-hidden="true" /> Add Puja</Link>
      </div>
      {isLoading && <p className="mt-5 rounded-lg bg-white p-4">Loading Pujas...</p>}
      {error && <p className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">{(error as Error).message}</p>}
      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-700"><tr><th className="p-3">Puja</th><th className="p-3">Region</th><th className="p-3">City</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {data.map((office) => (
              <tr key={office._id} className="border-t border-slate-200">
                <td className="p-3 font-medium">{office.title}</td>
                <td className="p-3">{office.region}</td>
                <td className="p-3">{office.city}</td>
                <td className="p-3">{office.active ? "Active" : "Inactive"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link href={`/locations/${office.slug}`} className="inline-flex min-h-11 items-center rounded-md border px-3 py-1">Preview</Link>
                    <Link href={`/admin/locations/${office._id}/edit`} aria-label={`Edit ${office.title}`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-2 py-1"><Edit className="h-4 w-4" aria-hidden="true" /></Link>
                    <button aria-label={`Delete ${office.title}`} onClick={() => window.confirm("Are you sure you want to permanently delete this Puja? Its gallery images will also be removed.") && remove.mutate(office._id)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-2 py-1 text-red-700"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
