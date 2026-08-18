"use client";

import { use } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, Navigation, Phone } from "lucide-react";
import { DynamicPanorama } from "@/components/DynamicPanorama";
import { Shell } from "@/components/Shell";
import { DynamicOfficeMap } from "@/components/maps/DynamicOfficeMap";
import { virtualTourForLocation } from "@/data/dummyVirtualTours";
import { api } from "@/services/api";
import { coordinatesOf, directionsUrl } from "@/utils/maps";

export default function LocationDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: office, isLoading, error } = useQuery({ queryKey: ["location", slug], queryFn: () => api.getLocation(slug) });

  return (
    <Shell>
      {isLoading && <p className="rounded-lg bg-white p-4">Loading office...</p>}
      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{(error as Error).message}</p>}
      {office && (() => {
        const virtualTour = virtualTourForLocation(office);
        return (
        <div className="space-y-8">
          <section>
            <h1 className="text-3xl font-semibold text-slate-950">{office.title}</h1>
            <p className="mt-2 text-slate-600">{office.fullAddress}</p>
            <a href={directionsUrl(coordinatesOf(office))} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              <Navigation className="h-4 w-4" /> Get Directions
            </a>
          </section>
          {office.photos.length > 0 && (
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {office.photos.map((photo) => (
                <div key={photo.publicId} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-200">
                  <Image src={photo.url} alt={photo.alt || office.title} fill className="object-cover" />
                </div>
              ))}
            </section>
          )}
          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="mt-3 leading-7 text-slate-700">{office.description}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-700">
              <h2 className="text-xl font-semibold text-slate-950">Contact</h2>
              {office.phone && <p className="mt-3 flex gap-2"><Phone className="h-4 w-4" /> {office.phone}</p>}
              {office.email && <p className="mt-3 flex gap-2"><Mail className="h-4 w-4" /> {office.email}</p>}
              {office.openingHours && <p className="mt-3 flex gap-2"><Clock className="h-4 w-4" /> {office.openingHours}</p>}
            </div>
          </section>
          <DynamicOfficeMap offices={[office]} center={coordinatesOf(office)} />
          {(virtualTour?.nodes.length || office.panorama360) && (
            <section>
              <h2 className="mb-3 text-2xl font-semibold text-slate-950">Explore This Office</h2>
              <DynamicPanorama src={office.panorama360?.url} tour={virtualTour} />
            </section>
          )}
        </div>
        );
      })()}
    </Shell>
  );
}
