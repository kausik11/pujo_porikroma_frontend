import Link from "next/link";
import { Shell } from "@/components/Shell";

export default function AdminPage() {
  return (
    <Shell>
      <h1 className="text-3xl font-semibold text-slate-950">Admin</h1>
      <p className="mt-3 rounded-lg bg-amber-50 p-4 text-amber-900">This version intentionally has no authentication. Do not expose this admin panel publicly without adding access control.</p>
      <Link href="/admin/locations" className="mt-5 inline-block rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Manage Locations</Link>
    </Shell>
  );
}
