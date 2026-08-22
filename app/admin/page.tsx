import Link from "next/link";
import { Shell } from "@/components/Shell";

export default function AdminPage() {
  return (
    <Shell>
      <h1 className="text-3xl font-semibold text-slate-950">PujaWay Admin</h1>
      <p className="mt-3 rounded-lg bg-white p-4 text-slate-700">Manage Puja listings, gallery images, route metadata, and 360 panorama uploads.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/admin/locations" className="inline-flex min-h-11 items-center rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">Manage Pujas</Link>
        <Link href="/admin/locations/new" className="inline-flex min-h-11 items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">Add a Puja</Link>
      </div>
    </Shell>
  );
}
