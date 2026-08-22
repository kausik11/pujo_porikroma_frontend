import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import type { Location } from "@/types/location";
import { coordinatesOf, directionsUrl, km } from "@/utils/maps";

export function OfficeCard({ office }: { office: Location }) {
  const point = coordinatesOf(office);
  return (
    <article className="rounded-lg border border-[#ddc686] bg-[#fffaf0] p-5 shadow-[0_18px_45px_rgba(82,59,20,0.08)] transition hover:-translate-y-0.5 hover:border-[#b88a22] hover:shadow-[0_24px_55px_rgba(82,59,20,0.13)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold leading-snug text-[#171612]">{office.title}</h2>
          <p className="mt-2 text-sm text-[#6b6252]">{office.city}, {office.state}</p>
          {office.distanceMeters != null && <p className="mt-3 text-sm font-semibold text-[#007f5f]">{km(office.distanceMeters)} away</p>}
        </div>
        <span className="rounded-full bg-[#ffe49b] px-3 py-1 text-xs font-bold text-[#4c3510]">{office.region}</span>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#5b5548]">{office.shortDescription || office.fullAddress}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/locations/${office.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#171612] px-4 py-2 text-sm font-semibold text-[#ffe49b]">
          <MapPin className="h-4 w-4" aria-hidden="true" /> View Puja
        </Link>
        <a href={directionsUrl(point)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#c9a953] bg-white px-4 py-2 text-sm font-semibold text-[#4c3510]">
          <Navigation className="h-4 w-4" aria-hidden="true" /> Directions
        </a>
      </div>
    </article>
  );
}
