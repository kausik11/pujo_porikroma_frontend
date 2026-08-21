"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImagePlus, LoaderCircle, MapPin, Save, Trash2, WandSparkles } from "lucide-react";
import { useRef, useState } from "react";
import { DynamicOfficeMap } from "@/components/maps/DynamicOfficeMap";
import {
  createAdminPuja,
  uploadAdminPujaPhotos,
  type CreatePujaInput,
} from "@/services/admin-pujas";
import type { CrowdLevel, Location, Region } from "@/types/location";

const REGIONS: Region[] = ["NORTH", "SOUTH", "EAST", "WEST", "CENTRAL"];
const CROWD_LEVELS: CrowdLevel[] = ["LOW", "MODERATE", "HIGH", "VERY_HIGH"];
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const DEFAULT_COORDINATES = { lat: 22.5726, lng: 88.3639 };

type Draft = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  fullAddress: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  country: string;
  postalCode: string;
  region: Region;
  lat: string;
  lng: string;
  phone: string;
  alternatePhone: string;
  email: string;
  openingHours: string;
  featured: boolean;
  verified: boolean;
  crowdLevel: "" | CrowdLevel;
  crowdUpdatedAt: string;
  bestVisitTime: string;
  pujaType: string;
  establishedYear: string;
  themeYear: string;
  themeName: string;
  idolStyle: string;
  pandalTheme: string;
  specialAttractions: string;
  nearestMetro: string;
  accessibility: string;
  visitTip: string;
  ratingAverage: string;
  ratingCount: string;
  active: boolean;
};

type ErrorKey = keyof Draft | "photos";
type FormErrors = Partial<Record<ErrorKey, string>>;
type Phase = "idle" | "creating" | "uploading" | "partial" | "success";

const INITIAL_DRAFT: Draft = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  fullAddress: "",
  landmark: "",
  city: "Kolkata",
  district: "Kolkata",
  state: "West Bengal",
  country: "India",
  postalCode: "",
  region: "CENTRAL",
  lat: String(DEFAULT_COORDINATES.lat),
  lng: String(DEFAULT_COORDINATES.lng),
  phone: "",
  alternatePhone: "",
  email: "",
  openingHours: "",
  featured: false,
  verified: false,
  crowdLevel: "",
  crowdUpdatedAt: "",
  bestVisitTime: "",
  pujaType: "",
  establishedYear: "",
  themeYear: "",
  themeName: "",
  idolStyle: "",
  pandalTheme: "",
  specialAttractions: "",
  nearestMetro: "",
  accessibility: "",
  visitTip: "",
  ratingAverage: "",
  ratingCount: "",
  active: true,
};

const baseInputClass =
  "min-h-11 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100";

function inputClass(hasError: boolean) {
  return `${baseInputClass} ${hasError ? "border-red-500" : "border-slate-300"}`;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalText(value: string) {
  return value.trim() || undefined;
}

function optionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function photoError(files: File[]) {
  if (files.length > MAX_PHOTOS) return `Choose no more than ${MAX_PHOTOS} photos.`;

  const unsupported = files.find((file) => !ALLOWED_PHOTO_TYPES.has(file.type));
  if (unsupported) return `${unsupported.name} is not a JPEG, PNG, WebP or AVIF image.`;

  const tooLarge = files.find((file) => file.size > MAX_PHOTO_BYTES);
  if (tooLarge) return `${tooLarge.name} is larger than 8 MB.`;

  return "";
}

function validate(draft: Draft, photos: File[]) {
  const errors: FormErrors = {};
  const requiredText: Array<[keyof Draft, string, number]> = [
    ["title", "Puja name", 2],
    ["description", "Description", 5],
    ["fullAddress", "Full address", 5],
    ["city", "City", 2],
    ["state", "State", 2],
    ["country", "Country", 2],
  ];

  requiredText.forEach(([key, label, minimum]) => {
    const value = String(draft[key]).trim();
    if (value.length < minimum) errors[key] = `${label} must be at least ${minimum} characters.`;
  });

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug.trim())) {
    errors.slug = "Use at least two lowercase letters or numbers, separated only by hyphens.";
  } else if (draft.slug.trim().length < 2) {
    errors.slug = "Slug must be at least 2 characters.";
  }

  const lat = Number(draft.lat);
  const lng = Number(draft.lng);
  if (!draft.lat.trim() || !Number.isFinite(lat) || lat < -90 || lat > 90) {
    errors.lat = "Enter a latitude from -90 to 90.";
  }
  if (!draft.lng.trim() || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    errors.lng = "Enter a longitude from -180 to 180.";
  }

  if (draft.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  const validateYear = (key: "establishedYear" | "themeYear", minimum: number, label: string) => {
    if (!draft[key].trim()) return;
    const value = Number(draft[key]);
    if (!Number.isInteger(value) || value < minimum || value > 2200) {
      errors[key] = `${label} must be a whole year from ${minimum} to 2200.`;
    }
  };
  validateYear("establishedYear", 1700, "Established year");
  validateYear("themeYear", 2000, "Theme year");

  if (draft.ratingAverage.trim()) {
    const value = Number(draft.ratingAverage);
    if (!Number.isFinite(value) || value < 0 || value > 5) {
      errors.ratingAverage = "Average rating must be from 0 to 5.";
    }
  }
  if (draft.ratingCount.trim()) {
    const value = Number(draft.ratingCount);
    if (!Number.isInteger(value) || value < 0) {
      errors.ratingCount = "Rating count must be a whole number of 0 or more.";
    }
  }

  const validateList = (key: "specialAttractions" | "accessibility", label: string) => {
    const items = splitLines(draft[key]);
    if (items.length > 30) errors[key] = `${label} can contain at most 30 items.`;
    else if (items.some((item) => item.length > 160)) errors[key] = `Each ${label.toLowerCase()} item must be 160 characters or fewer.`;
  };
  validateList("specialAttractions", "Special attractions");
  validateList("accessibility", "Accessibility");

  if (draft.visitTip.length > 1000) errors.visitTip = "Visitor tip must be 1,000 characters or fewer.";

  const fileError = photoError(photos);
  if (fileError) errors.photos = fileError;
  return errors;
}

function buildPayload(draft: Draft): CreatePujaInput {
  return {
    title: draft.title.trim(),
    slug: draft.slug.trim(),
    shortDescription: optionalText(draft.shortDescription),
    description: draft.description.trim(),
    fullAddress: draft.fullAddress.trim(),
    landmark: optionalText(draft.landmark),
    city: draft.city.trim(),
    district: optionalText(draft.district),
    state: draft.state.trim(),
    country: draft.country.trim(),
    postalCode: optionalText(draft.postalCode),
    region: draft.region,
    lat: Number(draft.lat),
    lng: Number(draft.lng),
    phone: optionalText(draft.phone),
    alternatePhone: optionalText(draft.alternatePhone),
    email: optionalText(draft.email),
    openingHours: optionalText(draft.openingHours),
    featured: draft.featured,
    verified: draft.verified,
    crowdLevel: draft.crowdLevel || undefined,
    crowdUpdatedAt: draft.crowdUpdatedAt ? new Date(draft.crowdUpdatedAt).toISOString() : undefined,
    bestVisitTime: optionalText(draft.bestVisitTime),
    pujaType: optionalText(draft.pujaType),
    establishedYear: optionalNumber(draft.establishedYear),
    themeYear: optionalNumber(draft.themeYear),
    themeName: optionalText(draft.themeName),
    idolStyle: optionalText(draft.idolStyle),
    pandalTheme: optionalText(draft.pandalTheme),
    specialAttractions: splitLines(draft.specialAttractions),
    nearestMetro: optionalText(draft.nearestMetro),
    accessibility: splitLines(draft.accessibility),
    visitTip: optionalText(draft.visitTip),
    ratingAverage: optionalNumber(draft.ratingAverage),
    ratingCount: optionalNumber(draft.ratingCount),
    active: draft.active,
  };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="text-sm text-red-700">{message}</p> : null;
}

export function CreatePujaForm() {
  const router = useRouter();
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT);
  const [slugEdited, setSlugEdited] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [requestError, setRequestError] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [createdPuja, setCreatedPuja] = useState<Location | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const pending = phase === "creating" || phase === "uploading";
  const locked = pending || Boolean(createdPuja);
  const lat = Number(draft.lat);
  const lng = Number(draft.lng);
  const mapCenter = Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lng) && lng >= -180 && lng <= 180
    ? { lat, lng }
    : DEFAULT_COORDINATES;

  function clearError(key: ErrorKey) {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    clearError(key);
  }

  function updateTitle(value: string) {
    setDraft((current) => ({
      ...current,
      title: value,
      slug: slugEdited ? current.slug : slugify(value),
    }));
    clearError("title");
    if (!slugEdited) clearError("slug");
  }

  function selectPhotos(files: File[]) {
    const message = photoError(files);
    if (message) {
      setErrors((current) => ({ ...current, photos: message }));
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }
    setPhotos(files);
    clearError("photos");
  }

  function focusErrorSummary() {
    window.requestAnimationFrame(() => summaryRef.current?.focus());
  }

  function navigateToCreated(puja: Location) {
    setPhase("success");
    setStatusMessage(puja.active ? "Puja created. Opening its public detail page." : "Draft Puja created. Returning to the admin list.");
    router.push(puja.active ? `/locations/${encodeURIComponent(puja.slug)}` : "/admin/locations");
    router.refresh();
  }

  async function uploadPhotos(puja: Location) {
    if (photos.length === 0) {
      navigateToCreated(puja);
      return;
    }

    setPhase("uploading");
    setRequestError("");
    setStatusMessage(`Uploading ${photos.length} gallery ${photos.length === 1 ? "photo" : "photos"}.`);
    try {
      const saved = await uploadAdminPujaPhotos(puja._id, photos);
      navigateToCreated(saved);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gallery upload failed.";
      setPhase("partial");
      setRequestError(message);
      setStatusMessage("The Puja was created, but its gallery still needs attention.");
      focusErrorSummary();
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || createdPuja) return;

    const nextErrors = validate(draft, photos);
    setErrors(nextErrors);
    setRequestError("");
    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage("Please correct the highlighted fields.");
      focusErrorSummary();
      return;
    }

    setPhase("creating");
    setStatusMessage("Creating the Puja record.");
    let saved: Location;
    try {
      saved = await createAdminPuja(buildPayload(draft));
      setCreatedPuja(saved);
    } catch (error) {
      setPhase("idle");
      setRequestError(error instanceof Error ? error.message : "The Puja could not be created.");
      setStatusMessage("The Puja could not be created.");
      focusErrorSummary();
      return;
    }

    await uploadPhotos(saved);
  }

  const validationMessages = Array.from(new Set(Object.values(errors).filter(Boolean)));
  const createdHref = createdPuja?.active
    ? `/locations/${encodeURIComponent(createdPuja.slug)}`
    : createdPuja
      ? `/admin/locations/${encodeURIComponent(createdPuja._id)}/edit`
      : "";

  return (
    <form noValidate onSubmit={submit} className="space-y-6">
      {(validationMessages.length > 0 || requestError) && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 outline-none focus-visible:ring-2 focus-visible:ring-red-700"
        >
          <p className="font-semibold">We could not save this Puja yet.</p>
          {requestError ? <p className="mt-1 text-sm">{requestError}</p> : null}
          {validationMessages.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {validationMessages.map((message) => <li key={message}>{message}</li>)}
            </ul>
          ) : null}
        </div>
      )}

      {createdPuja && phase === "partial" ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950" role="status">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">The Puja record was created.</p>
              <p className="mt-1 text-sm">Its gallery did not finish uploading. Retry here without creating a duplicate record.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void uploadPhotos(createdPuja)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                >
                  <ImagePlus className="h-4 w-4" aria-hidden="true" /> Retry photo upload
                </button>
                <Link
                  href={createdHref}
                  className="inline-flex min-h-11 items-center rounded-md border border-slate-400 bg-white px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                >
                  {createdPuja.active ? "View created Puja" : "Edit created draft"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <fieldset disabled={locked} className="space-y-6 disabled:opacity-75">
        <legend className="sr-only">New Puja information</legend>

        <section aria-labelledby="puja-basics-heading" className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <h2 id="puja-basics-heading" className="text-xl font-semibold text-slate-950">Puja details</h2>
          <p className="mt-1 text-sm text-slate-600">Name the pandal and describe what visitors can expect.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label htmlFor="title" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Puja name <span className="text-red-700">Required</span>
              <input
                id="title"
                value={draft.title}
                onChange={(event) => updateTitle(event.target.value)}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "title-error" : undefined}
                autoComplete="off"
                className={inputClass(Boolean(errors.title))}
              />
              <FieldError id="title-error" message={errors.title} />
            </label>
            <div className="grid gap-1.5">
              <label htmlFor="slug" className="text-sm font-medium text-slate-800">URL slug <span className="text-red-700">Required</span></label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="slug"
                  value={draft.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    update("slug", event.target.value.toLowerCase());
                  }}
                  aria-invalid={Boolean(errors.slug)}
                  aria-describedby={`slug-help${errors.slug ? " slug-error" : ""}`}
                  autoCapitalize="none"
                  spellCheck={false}
                  className={inputClass(Boolean(errors.slug))}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSlugEdited(false);
                    update("slug", slugify(draft.title));
                  }}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                >
                  <WandSparkles className="h-4 w-4" aria-hidden="true" /> Regenerate
                </button>
              </div>
              <p id="slug-help" className="text-xs text-slate-600">Lowercase letters, numbers and single hyphens only.</p>
              <FieldError id="slug-error" message={errors.slug} />
            </div>
            <label htmlFor="short-description" className="grid gap-1.5 text-sm font-medium text-slate-800 md:col-span-2">
              Short description
              <input
                id="short-description"
                value={draft.shortDescription}
                onChange={(event) => update("shortDescription", event.target.value)}
                placeholder="A concise summary for Puja cards and search results"
                className={inputClass(false)}
              />
            </label>
            <label htmlFor="description" className="grid gap-1.5 text-sm font-medium text-slate-800 md:col-span-2">
              Full description <span className="text-red-700">Required</span>
              <textarea
                id="description"
                rows={5}
                value={draft.description}
                onChange={(event) => update("description", event.target.value)}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? "description-error" : undefined}
                className={inputClass(Boolean(errors.description))}
              />
              <FieldError id="description-error" message={errors.description} />
            </label>
          </div>
        </section>

        <section aria-labelledby="puja-address-heading" className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <h2 id="puja-address-heading" className="flex items-center gap-2 text-xl font-semibold text-slate-950">
            <MapPin className="h-5 w-5" aria-hidden="true" /> Address and map position
          </h2>
          <p className="mt-1 text-sm text-slate-600">Enter exact coordinates or click the map to position the pandal.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label htmlFor="full-address" className="grid gap-1.5 text-sm font-medium text-slate-800 md:col-span-2">
              Full address <span className="text-red-700">Required</span>
              <textarea
                id="full-address"
                rows={2}
                value={draft.fullAddress}
                onChange={(event) => update("fullAddress", event.target.value)}
                aria-invalid={Boolean(errors.fullAddress)}
                aria-describedby={errors.fullAddress ? "full-address-error" : undefined}
                className={inputClass(Boolean(errors.fullAddress))}
              />
              <FieldError id="full-address-error" message={errors.fullAddress} />
            </label>
            <label htmlFor="landmark" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Landmark
              <input id="landmark" value={draft.landmark} onChange={(event) => update("landmark", event.target.value)} className={inputClass(false)} />
            </label>
            <label htmlFor="postal-code" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Postal code
              <input id="postal-code" value={draft.postalCode} onChange={(event) => update("postalCode", event.target.value)} inputMode="numeric" className={inputClass(false)} />
            </label>
            <label htmlFor="city" className="grid gap-1.5 text-sm font-medium text-slate-800">
              City <span className="text-red-700">Required</span>
              <input id="city" value={draft.city} onChange={(event) => update("city", event.target.value)} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? "city-error" : undefined} className={inputClass(Boolean(errors.city))} />
              <FieldError id="city-error" message={errors.city} />
            </label>
            <label htmlFor="district" className="grid gap-1.5 text-sm font-medium text-slate-800">
              District
              <input id="district" value={draft.district} onChange={(event) => update("district", event.target.value)} className={inputClass(false)} />
            </label>
            <label htmlFor="state" className="grid gap-1.5 text-sm font-medium text-slate-800">
              State <span className="text-red-700">Required</span>
              <input id="state" value={draft.state} onChange={(event) => update("state", event.target.value)} aria-invalid={Boolean(errors.state)} aria-describedby={errors.state ? "state-error" : undefined} className={inputClass(Boolean(errors.state))} />
              <FieldError id="state-error" message={errors.state} />
            </label>
            <label htmlFor="country" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Country <span className="text-red-700">Required</span>
              <input id="country" value={draft.country} onChange={(event) => update("country", event.target.value)} aria-invalid={Boolean(errors.country)} aria-describedby={errors.country ? "country-error" : undefined} className={inputClass(Boolean(errors.country))} />
              <FieldError id="country-error" message={errors.country} />
            </label>
            <label htmlFor="region" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Kolkata region <span className="text-red-700">Required</span>
              <select id="region" value={draft.region} onChange={(event) => update("region", event.target.value as Region)} className={inputClass(false)}>
                {REGIONS.map((region) => <option key={region} value={region}>{region.charAt(0) + region.slice(1).toLowerCase()}</option>)}
              </select>
            </label>
            <div aria-hidden="true" className="hidden md:block" />
            <label htmlFor="latitude" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Latitude <span className="text-red-700">Required</span>
              <input id="latitude" type="number" step="any" inputMode="decimal" value={draft.lat} onChange={(event) => update("lat", event.target.value)} aria-invalid={Boolean(errors.lat)} aria-describedby={errors.lat ? "latitude-error" : undefined} className={inputClass(Boolean(errors.lat))} />
              <FieldError id="latitude-error" message={errors.lat} />
            </label>
            <label htmlFor="longitude" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Longitude <span className="text-red-700">Required</span>
              <input id="longitude" type="number" step="any" inputMode="decimal" value={draft.lng} onChange={(event) => update("lng", event.target.value)} aria-invalid={Boolean(errors.lng)} aria-describedby={errors.lng ? "longitude-error" : undefined} className={inputClass(Boolean(errors.lng))} />
              <FieldError id="longitude-error" message={errors.lng} />
            </label>
          </div>
          <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
            <DynamicOfficeMap
              center={mapCenter}
              onMapClick={(point) => {
                update("lat", point.lat.toFixed(6));
                update("lng", point.lng.toFixed(6));
              }}
            />
          </div>
        </section>

        <section aria-labelledby="puja-profile-heading" className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <h2 id="puja-profile-heading" className="text-xl font-semibold text-slate-950">Public Puja profile</h2>
          <p className="mt-1 text-sm text-slate-600">These editorial details appear in the facts and about sections.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="flex min-h-11 items-start gap-3 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800">
              <input type="checkbox" checked={draft.featured} onChange={(event) => update("featured", event.target.checked)} className="mt-0.5 h-4 w-4" />
              <span><strong className="block">Feature on the homepage</strong><span className="text-slate-600">Include this Puja in the curated homepage card set.</span></span>
            </label>
            <label className="flex min-h-11 items-center gap-3 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800">
              <input type="checkbox" checked={draft.verified} onChange={(event) => update("verified", event.target.checked)} className="h-4 w-4" />
              Show verified badge
            </label>
            <label htmlFor="crowd-level" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Editorial crowd level
              <select id="crowd-level" value={draft.crowdLevel} onChange={(event) => update("crowdLevel", event.target.value as Draft["crowdLevel"])} className={inputClass(false)}>
                <option value="">Not available</option>
                {CROWD_LEVELS.map((level) => <option key={level} value={level}>{level.replace("_", " ")}</option>)}
              </select>
            </label>
            <label htmlFor="crowd-updated-at" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Crowd information updated at
              <input id="crowd-updated-at" type="datetime-local" value={draft.crowdUpdatedAt} onChange={(event) => update("crowdUpdatedAt", event.target.value)} className={inputClass(false)} />
            </label>
            <label htmlFor="best-time" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Best visiting time
              <input id="best-time" maxLength={500} value={draft.bestVisitTime} onChange={(event) => update("bestVisitTime", event.target.value)} placeholder="For example, 2:00 AM–5:00 AM" className={inputClass(false)} />
            </label>
            <label htmlFor="puja-type" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Puja type
              <input id="puja-type" maxLength={500} value={draft.pujaType} onChange={(event) => update("pujaType", event.target.value)} placeholder="For example, Barowari" className={inputClass(false)} />
            </label>
            <label htmlFor="established-year" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Established year
              <input id="established-year" type="number" min="1700" max="2200" step="1" value={draft.establishedYear} onChange={(event) => update("establishedYear", event.target.value)} aria-invalid={Boolean(errors.establishedYear)} aria-describedby={errors.establishedYear ? "established-year-error" : undefined} className={inputClass(Boolean(errors.establishedYear))} />
              <FieldError id="established-year-error" message={errors.establishedYear} />
            </label>
            <label htmlFor="theme-year" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Theme year
              <input id="theme-year" type="number" min="2000" max="2200" step="1" value={draft.themeYear} onChange={(event) => update("themeYear", event.target.value)} aria-invalid={Boolean(errors.themeYear)} aria-describedby={errors.themeYear ? "theme-year-error" : undefined} className={inputClass(Boolean(errors.themeYear))} />
              <FieldError id="theme-year-error" message={errors.themeYear} />
            </label>
            <label htmlFor="theme-name" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Theme name
              <input id="theme-name" maxLength={500} value={draft.themeName} onChange={(event) => update("themeName", event.target.value)} className={inputClass(false)} />
            </label>
            <label htmlFor="idol-style" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Idol style
              <input id="idol-style" maxLength={500} value={draft.idolStyle} onChange={(event) => update("idolStyle", event.target.value)} placeholder="For example, Traditional" className={inputClass(false)} />
            </label>
            <label htmlFor="pandal-theme" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Pandal theme
              <input id="pandal-theme" maxLength={500} value={draft.pandalTheme} onChange={(event) => update("pandalTheme", event.target.value)} className={inputClass(false)} />
            </label>
            <label htmlFor="nearest-metro" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Nearest metro
              <input id="nearest-metro" maxLength={500} value={draft.nearestMetro} onChange={(event) => update("nearestMetro", event.target.value)} className={inputClass(false)} />
            </label>
            <label htmlFor="special-attractions" className="grid gap-1.5 text-sm font-medium text-slate-800 md:col-span-2">
              Special attractions <span className="font-normal text-slate-500">One per line</span>
              <textarea id="special-attractions" rows={4} value={draft.specialAttractions} onChange={(event) => update("specialAttractions", event.target.value)} aria-invalid={Boolean(errors.specialAttractions)} aria-describedby={errors.specialAttractions ? "special-attractions-error" : undefined} className={inputClass(Boolean(errors.specialAttractions))} />
              <FieldError id="special-attractions-error" message={errors.specialAttractions} />
            </label>
            <label htmlFor="accessibility" className="grid gap-1.5 text-sm font-medium text-slate-800 md:col-span-2">
              Accessibility information <span className="font-normal text-slate-500">One item per line</span>
              <textarea id="accessibility" rows={3} value={draft.accessibility} onChange={(event) => update("accessibility", event.target.value)} aria-invalid={Boolean(errors.accessibility)} aria-describedby={errors.accessibility ? "accessibility-error" : undefined} className={inputClass(Boolean(errors.accessibility))} />
              <FieldError id="accessibility-error" message={errors.accessibility} />
            </label>
            <label htmlFor="visit-tip" className="grid gap-1.5 text-sm font-medium text-slate-800 md:col-span-2">
              Visitor tip
              <textarea id="visit-tip" rows={3} maxLength={1000} value={draft.visitTip} onChange={(event) => update("visitTip", event.target.value)} aria-invalid={Boolean(errors.visitTip)} aria-describedby={`visit-tip-count${errors.visitTip ? " visit-tip-error" : ""}`} className={inputClass(Boolean(errors.visitTip))} />
              <span id="visit-tip-count" className="text-xs font-normal text-slate-500">{draft.visitTip.length}/1,000 characters</span>
              <FieldError id="visit-tip-error" message={errors.visitTip} />
            </label>
          </div>
        </section>

        <section aria-labelledby="puja-contact-heading" className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <h2 id="puja-contact-heading" className="text-xl font-semibold text-slate-950">Contact and rating</h2>
          <p className="mt-1 text-sm text-slate-600">Ratings are display-only aggregate values; this form does not create visitor reviews.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label htmlFor="phone" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Phone
              <input id="phone" type="tel" value={draft.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" className={inputClass(false)} />
            </label>
            <label htmlFor="alternate-phone" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Alternate phone
              <input id="alternate-phone" type="tel" value={draft.alternatePhone} onChange={(event) => update("alternatePhone", event.target.value)} className={inputClass(false)} />
            </label>
            <label htmlFor="email" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Email
              <input id="email" type="email" value={draft.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className={inputClass(Boolean(errors.email))} />
              <FieldError id="email-error" message={errors.email} />
            </label>
            <label htmlFor="opening-hours" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Opening hours
              <input id="opening-hours" value={draft.openingHours} onChange={(event) => update("openingHours", event.target.value)} className={inputClass(false)} />
            </label>
            <label htmlFor="rating-average" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Average rating (0–5)
              <input id="rating-average" type="number" min="0" max="5" step="0.1" value={draft.ratingAverage} onChange={(event) => update("ratingAverage", event.target.value)} aria-invalid={Boolean(errors.ratingAverage)} aria-describedby={errors.ratingAverage ? "rating-average-error" : undefined} className={inputClass(Boolean(errors.ratingAverage))} />
              <FieldError id="rating-average-error" message={errors.ratingAverage} />
            </label>
            <label htmlFor="rating-count" className="grid gap-1.5 text-sm font-medium text-slate-800">
              Rating count
              <input id="rating-count" type="number" min="0" step="1" value={draft.ratingCount} onChange={(event) => update("ratingCount", event.target.value)} aria-invalid={Boolean(errors.ratingCount)} aria-describedby={errors.ratingCount ? "rating-count-error" : undefined} className={inputClass(Boolean(errors.ratingCount))} />
              <FieldError id="rating-count-error" message={errors.ratingCount} />
            </label>
          </div>
        </section>

        <section aria-labelledby="puja-gallery-heading" className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <h2 id="puja-gallery-heading" className="text-xl font-semibold text-slate-950">Puja gallery</h2>
          <p id="photos-help" className="mt-1 text-sm text-slate-600">Choose up to 10 JPEG, PNG, WebP or AVIF images. Each file can be up to 8 MB; the first image becomes the hero image.</p>
          <label htmlFor="photos" className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 focus-within:ring-2 focus-within:ring-slate-950 focus-within:ring-offset-2">
            <ImagePlus className="h-4 w-4" aria-hidden="true" /> Choose photos
            <input
              ref={photoInputRef}
              id="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={(event) => selectPhotos(Array.from(event.target.files ?? []))}
              aria-invalid={Boolean(errors.photos)}
              aria-describedby={`photos-help${errors.photos ? " photos-error" : ""}`}
              className="sr-only"
            />
          </label>
          <FieldError id="photos-error" message={errors.photos} />
          {photos.length > 0 ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Selected gallery photos">
              {photos.map((photo, index) => (
                <li key={`${photo.name}-${photo.lastModified}`} className="flex min-w-0 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                  <ImagePlus className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{index + 1}. {photo.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = photos.filter((_, photoIndex) => photoIndex !== index);
                      setPhotos(next);
                      clearError("photos");
                      if (next.length === 0 && photoInputRef.current) photoInputRef.current.value = "";
                    }}
                    aria-label={`Remove ${photo.name}`}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section aria-labelledby="puja-publishing-heading" className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <h2 id="puja-publishing-heading" className="text-xl font-semibold text-slate-950">Publishing</h2>
          <label className="mt-4 flex min-h-11 items-start gap-3 rounded-md border border-slate-300 p-3 text-sm text-slate-800">
            <input type="checkbox" checked={draft.active} onChange={(event) => update("active", event.target.checked)} className="mt-0.5 h-4 w-4" />
            <span><strong className="block">Publish this Puja now</strong><span className="text-slate-600">Inactive records stay in admin and cannot open on the public detail route.</span></span>
          </label>
        </section>
      </fieldset>

      <p className="sr-only" aria-live="polite">{statusMessage}</p>

      {!createdPuja ? (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <Link href="/admin/locations" className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2">Cancel</Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {phase === "creating" ? "Creating Puja…" : phase === "uploading" ? "Uploading photos…" : "Create Puja"}
          </button>
        </div>
      ) : phase !== "partial" ? (
        <div role="status" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900">
          {phase === "uploading" ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          {statusMessage}
        </div>
      ) : null}
    </form>
  );
}
