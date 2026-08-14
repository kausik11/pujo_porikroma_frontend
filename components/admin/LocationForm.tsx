"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { DynamicOfficeMap } from "@/components/maps/DynamicOfficeMap";
import { api } from "@/services/api";
import type { Location, LocationFormInput, Region } from "@/types/location";

const regions: Region[] = ["NORTH", "SOUTH", "EAST", "WEST", "CENTRAL"];

const empty: LocationFormInput = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  fullAddress: "",
  landmark: "",
  city: "",
  district: "",
  state: "",
  country: "India",
  postalCode: "",
  region: "CENTRAL",
  lat: 22.5726,
  lng: 88.3639,
  phone: "",
  alternatePhone: "",
  email: "",
  openingHours: "",
  active: true
};

function formFromLocation(location?: Location): LocationFormInput {
  if (!location) return empty;
  return {
    title: location.title,
    slug: location.slug,
    shortDescription: location.shortDescription ?? "",
    description: location.description,
    fullAddress: location.fullAddress,
    landmark: location.landmark ?? "",
    city: location.city,
    district: location.district ?? "",
    state: location.state,
    country: location.country,
    postalCode: location.postalCode ?? "",
    region: location.region,
    lat: location.location.coordinates[1],
    lng: location.location.coordinates[0],
    phone: location.phone ?? "",
    alternatePhone: location.alternatePhone ?? "",
    email: location.email ?? "",
    openingHours: location.openingHours ?? "",
    active: location.active
  };
}

export function LocationForm({ location }: { location?: Location }) {
  const router = useRouter();
  const [form, setForm] = useState<LocationFormInput>(() => formFromLocation(location));
  const [photos, setPhotos] = useState<File[]>([]);
  const [panorama, setPanorama] = useState<File | null>(null);
  const [aspectWarning, setAspectWarning] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      const saved = location ? await api.updateLocation(location._id, form) : await api.createLocation(form);
      if (photos.length) await api.uploadGallery(saved._id, photos);
      if (panorama) await api.uploadPanorama(saved._id, panorama);
      return saved;
    },
    onSuccess: () => router.push("/admin/locations")
  });

  function update<K extends keyof LocationFormInput>(key: K, value: LocationFormInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onPanorama(file: File | null) {
    setPanorama(file);
    setAspectWarning("");
    if (!file) return;
    const image = new Image();
    image.onload = () => {
      const ratio = image.width / image.height;
      if (Math.abs(ratio - 2) > 0.25) setAspectWarning("This panorama is not close to a 2:1 equirectangular aspect ratio.");
      URL.revokeObjectURL(image.src);
    };
    image.src = URL.createObjectURL(file);
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-semibold">Office Details</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input required value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Office Title" className="rounded-md border px-3 py-2" />
          <input required value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="Slug" className="rounded-md border px-3 py-2" />
          <input value={form.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} placeholder="Short Description" className="rounded-md border px-3 py-2 md:col-span-2" />
          <textarea required value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Full Description" className="min-h-28 rounded-md border px-3 py-2 md:col-span-2" />
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-semibold">Address</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input required value={form.fullAddress} onChange={(event) => update("fullAddress", event.target.value)} placeholder="Full Address" className="rounded-md border px-3 py-2 md:col-span-2" />
          <input value={form.landmark} onChange={(event) => update("landmark", event.target.value)} placeholder="Landmark" className="rounded-md border px-3 py-2" />
          <input required value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="City" className="rounded-md border px-3 py-2" />
          <input value={form.district} onChange={(event) => update("district", event.target.value)} placeholder="District" className="rounded-md border px-3 py-2" />
          <input required value={form.state} onChange={(event) => update("state", event.target.value)} placeholder="State" className="rounded-md border px-3 py-2" />
          <input required value={form.country} onChange={(event) => update("country", event.target.value)} placeholder="Country" className="rounded-md border px-3 py-2" />
          <input value={form.postalCode} onChange={(event) => update("postalCode", event.target.value)} placeholder="Postal Code" className="rounded-md border px-3 py-2" />
          <select value={form.region} onChange={(event) => update("region", event.target.value as Region)} className="rounded-md border px-3 py-2">{regions.map((region) => <option key={region}>{region}</option>)}</select>
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-semibold">Coordinates</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="number" step="any" required value={form.lat} onChange={(event) => update("lat", Number(event.target.value))} placeholder="Latitude" className="rounded-md border px-3 py-2" />
          <input type="number" step="any" required value={form.lng} onChange={(event) => update("lng", Number(event.target.value))} placeholder="Longitude" className="rounded-md border px-3 py-2" />
        </div>
        <div className="mt-4"><DynamicOfficeMap center={{ lat: form.lat, lng: form.lng }} onMapClick={(point) => setForm((current) => ({ ...current, ...point }))} /></div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-semibold">Contact</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Phone" className="rounded-md border px-3 py-2" />
          <input value={form.alternatePhone} onChange={(event) => update("alternatePhone", event.target.value)} placeholder="Alternate Phone" className="rounded-md border px-3 py-2" />
          <input value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="Email" className="rounded-md border px-3 py-2" />
          <input value={form.openingHours} onChange={(event) => update("openingHours", event.target.value)} placeholder="Opening Hours" className="rounded-md border px-3 py-2" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(event) => update("active", event.target.checked)} /> Active</label>
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-semibold">Office Gallery</h2>
        <input multiple accept="image/*" type="file" onChange={(event) => setPhotos(Array.from(event.target.files ?? []))} className="mt-4" />
        {photos.length > 0 && <div className="mt-3 text-sm text-slate-600">{photos.length} image(s) selected.</div>}
        <h2 className="mt-6 text-xl font-semibold">360 Panorama</h2>
        <input accept="image/*" type="file" onChange={(event) => onPanorama(event.target.files?.[0] ?? null)} className="mt-4" />
        {aspectWarning && <p className="mt-2 rounded-md bg-amber-50 p-2 text-sm text-amber-800">{aspectWarning}</p>}
      </section>
      {save.error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{save.error.message}</p>}
      <button disabled={save.isPending} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"><Save className="h-4 w-4" /> Save Location</button>
    </form>
  );
}
