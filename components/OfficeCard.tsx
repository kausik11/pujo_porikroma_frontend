import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import type { Location } from "@/types/location";
import { coordinatesOf, directionsUrl, km } from "@/utils/maps";

export function OfficeCard({ office }: { office: Location }) {
  const point = coordinatesOf(office);
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{office.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{office.city}, {office.state}</p>
          {office.distanceMeters != null && <p className="mt-2 text-sm font-medium text-emerald-700">{km(office.distanceMeters)} away</p>}
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{office.region}</span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{office.shortDescription || office.fullAddress}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/locations/${office.slug}`} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white">
          <MapPin className="h-4 w-4" aria-hidden="true" /> View Puja
        </Link>
        <a href={directionsUrl(point)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800">
          <Navigation className="h-4 w-4" aria-hidden="true" /> Directions
        </a>
      </div>
    </article>
  );
}
