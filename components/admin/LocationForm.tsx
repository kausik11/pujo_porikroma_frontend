"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, ImagePlus, Save, Trash2, UploadCloud } from "lucide-react";
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

function fileSizeLabel(file: File) {
  const units = ["B", "KB", "MB", "GB"];
  let size = file.size;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
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
  const [currentPanorama, setCurrentPanorama] = useState(location?.panorama360);
  const [panoramaPreviewUrl, setPanoramaPreviewUrl] = useState("");
  const [aspectWarning, setAspectWarning] = useState("");
  const panoramaPreviewUrlRef = useRef("");

  const save = useMutation({
    mutationFn: async () => {
      const saved = location ? await api.updateLocation(location._id, form) : await api.createLocation(form);
      if (photos.length) await api.uploadGallery(saved._id, photos);
      if (panorama) await api.uploadPanorama(saved._id, panorama);
      return saved;
    },
    onSuccess: () => router.push("/admin/locations")
  });

  const removePanorama = useMutation({
    mutationFn: async () => {
      if (!location) return undefined;
      return api.removePanorama(location._id);
    },
    onSuccess: (updated) => {
      setCurrentPanorama(updated?.panorama360);
      setPanorama(null);
      router.refresh();
    }
  });

  function update<K extends keyof LocationFormInput>(key: K, value: LocationFormInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onPanorama(file: File | null) {
    if (panoramaPreviewUrlRef.current) {
      URL.revokeObjectURL(panoramaPreviewUrlRef.current);
      panoramaPreviewUrlRef.current = "";
    }
    setPanorama(file);
    setPanoramaPreviewUrl("");
    setAspectWarning("");
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    panoramaPreviewUrlRef.current = previewUrl;
    setPanoramaPreviewUrl(previewUrl);
    const image = new Image();
    image.onload = () => {
      const ratio = image.width / image.height;
      if (Math.abs(ratio - 2) > 0.25) setAspectWarning("This panorama is not close to a 2:1 equirectangular aspect ratio.");
      URL.revokeObjectURL(image.src);
    };
    image.onerror = () => URL.revokeObjectURL(image.src);
    image.src = URL.createObjectURL(file);
  }

  useEffect(() => {
    return () => {
      if (panoramaPreviewUrlRef.current) URL.revokeObjectURL(panoramaPreviewUrlRef.current);
    };
  }, []);

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
            Publish on the homepage and in Puja Trails
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Puja Gallery</h2>
            <p className="mt-1 text-sm text-slate-600">Add regular Puja photos for the gallery carousel.</p>
          </div>
          {photos.length > 0 ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {photos.length} selected
            </span>
          ) : null}
        </div>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-slate-500 hover:bg-white focus-within:border-slate-950 focus-within:ring-2 focus-within:ring-slate-950/10">
          <input multiple accept="image/*" type="file" onChange={(event) => setPhotos(Array.from(event.target.files ?? []))} className="sr-only" />
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-950 shadow-sm">
            <ImagePlus className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="mt-3 text-sm font-semibold text-slate-950">Upload gallery images</span>
          <span className="mt-1 text-sm text-slate-500">Choose multiple JPG, PNG, or WebP files</span>
        </label>
        {photos.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {photos.map((photo) => (
              <span key={`${photo.name}-${photo.size}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {photo.name} · {fileSizeLabel(photo)}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-8 border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold">360 Panorama</h2>
          <p className="mt-1 text-sm text-slate-600">Upload one 2:1 equirectangular panorama image. This powers the public 360 viewer.</p>
        </div>
        {currentPanorama ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <div className="relative aspect-[2/1] w-full">
              <NextImage src={currentPanorama.url} alt={currentPanorama.alt ?? "Current 360 panorama"} fill sizes="(min-width: 768px) 720px, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-3">
              <p className="text-sm text-slate-600">Current 360 panorama is uploaded.</p>
              <button
                type="button"
                onClick={() => removePanorama.mutate()}
                disabled={removePanorama.isPending}
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {removePanorama.isPending ? "Removing..." : "Remove panorama"}
              </button>
            </div>
          </div>
        ) : null}
        <label className="mt-4 grid cursor-pointer gap-4 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 p-4 transition hover:border-amber-500 hover:bg-amber-50 focus-within:border-slate-950 focus-within:ring-2 focus-within:ring-slate-950/10 md:grid-cols-[minmax(260px,0.82fr)_minmax(0,1.18fr)]">
          <input accept="image/*" type="file" onChange={(event) => onPanorama(event.target.files?.[0] ?? null)} className="sr-only" />
          <div className="relative aspect-[2/1] overflow-hidden rounded-md border border-amber-200 bg-white">
            {panoramaPreviewUrl ? (
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${panoramaPreviewUrl}")` }} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-5 text-center text-amber-900">
                <UploadCloud className="h-9 w-9" aria-hidden="true" />
                <span className="mt-2 text-sm font-semibold">Panorama preview</span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-base font-semibold text-slate-950">{panorama ? "Panorama ready to upload" : "Choose 360 panorama image"}</span>
            <span className="mt-2 text-sm leading-6 text-slate-600">
              Best result: wide 2:1 image, for example 4000 x 2000 px. Replacing the file here will update the public 360 view after saving.
            </span>
            {panorama ? (
              <span className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {panorama.name} · {fileSizeLabel(panorama)}
              </span>
            ) : (
              <span className="mt-3 inline-flex w-fit rounded-full bg-white px-3 py-1 text-sm font-semibold text-amber-900">Click to attach file</span>
            )}
          </div>
        </label>
        {aspectWarning && <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">{aspectWarning}</p>}
      </section>
      {save.error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{save.error.message}</p>}
      {removePanorama.error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{removePanorama.error.message}</p>}
      <button disabled={save.isPending} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"><Save className="h-4 w-4" /> Save Puja</button>
    </form>
  );
}
