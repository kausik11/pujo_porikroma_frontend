import type { Metadata } from "next";
import Link from "next/link";
import { CreatePujaForm } from "@/components/admin/CreatePujaForm";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Add Puja | PujaWay Admin",
  description: "Create a Puja or pandal listing for PujaWay.",
};

export default function NewLocationPage() {
  return (
    <Shell>
      <div className="mb-6">
        <Link href="/admin/locations" className="inline-flex min-h-11 items-center text-sm font-medium text-slate-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">
          Back to Pujas
        </Link>
        <h1 className="text-3xl font-semibold text-slate-950">Add a Puja</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Create the public pandal profile first, then upload its gallery through the supported PujaWay media flow.</p>
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">This admin panel does not have authentication yet. Do not expose it publicly until access control is added.</p>
      </div>
      <CreatePujaForm />
    </Shell>
  );
}
