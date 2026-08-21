"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { DynamicOfficeMap } from "@/components/maps/DynamicOfficeMap";
import { api } from "@/services/api";
import type { CrowdLevel, Location, LocationFormInput, Region } from "@/types/location";

const regions: Region[] = ["NORTH", "SOUTH", "EAST", "WEST", "CENTRAL"];
const crowdLevels: CrowdLevel[] = ["LOW", "MODERATE", "HIGH", "VERY_HIGH"];

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
  featured: false,
  verified: false,
  bestVisitTime: "",
  pujaType: "",
  themeName: "",
  idolStyle: "",
  pandalTheme: "",
  specialAttractions: [],
  nearestMetro: "",
  accessibility: [],
  visitTip: "",
  active: true
};

function toLocalDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(localTime).toISOString().slice(0, 16);
}

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalNumber(value: string) {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

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
    featured: location.featured ?? false,
    verified: location.verified ?? false,
    crowdLevel: location.crowdLevel,
    crowdUpdatedAt: location.crowdUpdatedAt,
    bestVisitTime: location.bestVisitTime ?? "",
    pujaType: location.pujaType ?? "",
    establishedYear: location.establishedYear,
    themeYear: location.themeYear,
    themeName: location.themeName ?? "",
    idolStyle: location.idolStyle ?? "",
    pandalTheme: location.pandalTheme ?? "",
    specialAttractions: location.specialAttractions ?? [],
    nearestMetro: location.nearestMetro ?? "",
    accessibility: location.accessibility ?? [],
    visitTip: location.visitTip ?? "",
    ratingAverage: location.ratingAverage,
    ratingCount: location.ratingCount,
    active: location.active
  };
}

export function LocationForm({ location }: { location?: Location }) {
  const router = useRouter();
  const [form, setForm] = useState<LocationFormInput>(() => formFromLocation(location));
  const [specialAttractionsText, setSpecialAttractionsText] = useState(
    () => location?.specialAttractions?.join("\n") ?? "",
  );
  const [accessibilityText, setAccessibilityText] = useState(
    () => location?.accessibility?.join("\n") ?? "",
  );
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
        <h2 className="text-xl font-semibold">Puja Details</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input required value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Puja Title" aria-label="Puja title" className="rounded-md border px-3 py-2" />
          <input required value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="Slug" className="rounded-md border px-3 py-2" />
          <input value={form.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} placeholder="Short Description" className="rounded-md border px-3 py-2 md:col-span-2" />
          <textarea required value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Full Description" className="min-h-28 rounded-md border px-3 py-2 md:col-span-2" />
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-semibold">Puja Profile</h2>
        <p className="mt-1 text-sm text-slate-600">Editorial facts shown on the public Puja detail page.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-slate-800">
            <input type="checkbox" checked={form.featured ?? false} onChange={(event) => update("featured", event.target.checked)} />
            Feature on the homepage
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-slate-800">
            <input type="checkbox" checked={form.verified ?? false} onChange={(event) => update("verified", event.target.checked)} />
            Verified listing
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Crowd level
            <select
              value={form.crowdLevel ?? ""}
              onChange={(event) => update("crowdLevel", event.target.value ? event.target.value as CrowdLevel : undefined)}
              className="min-h-11 rounded-md border px-3 py-2 font-normal text-slate-950"
            >
              <option value="">Not available</option>
              {crowdLevels.map((level) => <option key={level} value={level}>{level.replace("_", " ")}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Crowd information updated at
            <input
              type="datetime-local"
              value={toLocalDateTime(form.crowdUpdatedAt)}
              onChange={(event) => update("crowdUpdatedAt", event.target.value ? new Date(event.target.value).toISOString() : undefined)}
              className="min-h-11 rounded-md border px-3 py-2 font-normal text-slate-950"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Best visiting time
            <input value={form.bestVisitTime ?? ""} onChange={(event) => update("bestVisitTime", event.target.value)} placeholder="For example, 2:00 AM–5:00 AM" className="min-h-11 rounded-md border px-3 py-2 font-normal text-slate-950" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Puja type
            <input value={form.pujaType ?? ""} onChange={(event) => update("pujaType", event.target.value)} placeholder="For example, Barowari" className="min-h-11 rounded-md border px-3 py-2 font-normal text-slate-950" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Established year
            <input type="number" min="1700" max="2200" value={form.establishedYear ?? ""} onChange={(event) => update("establishedYear", optionalNumber(event.target.value))} className="min-h-11 rounded-md border px-3 py-2 font-normal text-slate-950" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Theme year
            <input type="number" min="2000" max="2200" value={form.themeYear ?? ""} onChange={(event) => update("themeYear", optionalNumber(event.target.value))} className="min-h-11 rounded-md border px-3 py-2 font-normal text-slate-950" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Theme name
            <input value={form.themeName ?? ""} onChange={(event) => update("themeName", event.target.value)} className="min-h-11 rounded-md border px-3 py-2 font-normal text-slate-950" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Idol style
            <input value={form.idolStyle ?? ""} onChange={(event) => update("idolStyle", event.target.value)} placeholder="For example, Traditional" className="min-h-11 rounded-md border px-3 py-2 font-normal text-slate-950" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Pandal theme
            <input value={form.pandalTheme ?? ""} onChange={(event) => update("pandalTheme", event.target.value)} className="min-h-11 rounded-md border px-3 py-2 font-normal text-slate-950" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Nearest metro
            <input value={form.nearestMetro ?? ""} onChange={(event) => update("nearestMetro", event.target.value)} className="min-h-11 rounded-md border px-3 py-2 font-normal text-slate-950" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700 md:col-span-2">
            Special attractions (one per line)
            <textarea
              value={specialAttractionsText}
              onChange={(event) => {
                setSpecialAttractionsText(event.target.value);
                update("specialAttractions", lines(event.target.value));
              }}
              rows={3}
              className="rounded-md border px-3 py-2 font-normal text-slate-950"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700 md:col-span-2">
            Accessibility (one item per line)
            <textarea
              value={accessibilityText}
              onChange={(event) => {
                setAccessibilityText(event.target.value);
                update("accessibility", lines(event.target.value));
              }}
              rows={3}
              className="rounded-md border px-3 py-2 font-normal text-slate-950"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700 md:col-span-2">
            Visitor tip
            <textarea value={form.visitTip ?? ""} onChange={(event) => update("visitTip", event.target.value)} rows={3} className="rounded-md border px-3 py-2 font-normal text-slate-950" />
          </label>
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-semibold">Aggregate Rating</h2>
        <p className="mt-1 text-sm text-slate-600">Display-only editorial values; this does not enable visitor review submission.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Average rating (0–5)
            <input type="number" min="0" max="5" step="0.1" value={form.ratingAverage ?? ""} onChange={(event) => update("ratingAverage", optionalNumber(event.target.value))} className="min-h-11 rounded-md border px-3 py-2 font-normal text-slate-950" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Rating count
            <input type="number" min="0" step="1" value={form.ratingCount ?? ""} onChange={(event) => update("ratingCount", optionalNumber(event.target.value))} className="min-h-11 rounded-md border px-3 py-2 font-normal text-slate-950" />
          </label>
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
        <h2 className="text-xl font-semibold">Puja Gallery</h2>
        <input multiple accept="image/*" type="file" onChange={(event) => setPhotos(Array.from(event.target.files ?? []))} className="mt-4" />
        {photos.length > 0 && <div className="mt-3 text-sm text-slate-600">{photos.length} image(s) selected.</div>}
        <h2 className="mt-6 text-xl font-semibold">360 Panorama</h2>
        <input accept="image/*" type="file" onChange={(event) => onPanorama(event.target.files?.[0] ?? null)} className="mt-4" />
        {aspectWarning && <p className="mt-2 rounded-md bg-amber-50 p-2 text-sm text-amber-800">{aspectWarning}</p>}
      </section>
      {save.error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{save.error.message}</p>}
      <button disabled={save.isPending} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"><Save className="h-4 w-4" /> Save Puja</button>
    </form>
  );
}
