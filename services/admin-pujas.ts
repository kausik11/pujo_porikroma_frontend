import type { CrowdLevel, Location, Region } from "@/types/location";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api").replace(/\/$/, "");

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ message?: string; path?: Array<string | number> }>;
};

export type CreatePujaInput = {
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  fullAddress: string;
  landmark?: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  postalCode?: string;
  region: Region;
  lat: number;
  lng: number;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  openingHours?: string;
  featured?: boolean;
  verified?: boolean;
  crowdLevel?: CrowdLevel;
  crowdUpdatedAt?: string;
  bestVisitTime?: string;
  pujaType?: string;
  establishedYear?: number;
  themeYear?: number;
  themeName?: string;
  idolStyle?: string;
  pandalTheme?: string;
  specialAttractions?: string[];
  nearestMetro?: string;
  accessibility?: string[];
  visitTip?: string;
  ratingAverage?: number;
  ratingCount?: number;
  active: boolean;
};

function errorMessage<T>(payload: ApiEnvelope<T> | null, fallback: string) {
  const issue = payload?.errors?.[0];
  const field = issue?.path?.length ? `${issue.path.join(".")}: ` : "";
  return issue?.message
    ? `${payload?.message ?? "Validation failed"} (${field}${issue.message})`
    : payload?.message ?? fallback;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success || payload.data === undefined) {
    throw new Error(errorMessage(payload, `Request failed with status ${response.status}`));
  }

  return payload.data;
}

export function createAdminPuja(input: CreatePujaInput) {
  return request<Location>("/admin/locations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function uploadAdminPujaPhotos(locationId: string, photos: File[]) {
  const body = new FormData();
  photos.forEach((photo) => body.append("photos", photo));

  return request<Location>(`/admin/locations/${encodeURIComponent(locationId)}/gallery`, {
    method: "POST",
    body,
  });
}
