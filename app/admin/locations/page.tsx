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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Locations</h1>
          <p className="mt-2 text-sm text-amber-800">Unauthenticated admin route. Add auth before public production exposure.</p>
        </div>
        <Link href="/admin/locations/new" className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Add Location</Link>
      </div>
      {isLoading && <p className="mt-5 rounded-lg bg-white p-4">Loading locations...</p>}
      {error && <p className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">{(error as Error).message}</p>}
      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-700"><tr><th className="p-3">Office</th><th className="p-3">Region</th><th className="p-3">City</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {data.map((office) => (
              <tr key={office._id} className="border-t border-slate-200">
                <td className="p-3 font-medium">{office.title}</td>
                <td className="p-3">{office.region}</td>
                <td className="p-3">{office.city}</td>
                <td className="p-3">{office.active ? "Active" : "Inactive"}</td>
                <td className="flex gap-2 p-3">
                  <Link href={`/locations/${office.slug}`} className="rounded-md border px-2 py-1">Preview</Link>
                  <Link href={`/admin/locations/${office._id}/edit`} className="rounded-md border px-2 py-1"><Edit className="h-4 w-4" /></Link>
                  <button onClick={() => window.confirm("Are you sure you want to permanently delete this office? Its Cloudinary images will also be removed.") && remove.mutate(office._id)} className="rounded-md border px-2 py-1 text-red-700"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
