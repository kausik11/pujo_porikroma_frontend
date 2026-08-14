import type { Location, LocationFormInput } from "@/types/location";
import type { AlongRouteOffice, Coordinate, RouteResult } from "@/types/routing";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type ApiResponse<T> = { success: boolean; data: T; message?: string; errors?: unknown[] };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: init?.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store"
  });
  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !json.success) throw new Error(json.message || "API request failed");
  return json.data;
}

function body(data: unknown): RequestInit {
  return { method: "POST", body: JSON.stringify(data) };
}

export const api = {
  listLocations: (params = "") => request<Location[]>(`/locations${params}`),
  getLocation: (slug: string) => request<Location>(`/locations/${slug}`),
  nearby: (lat: number, lng: number, limit = 10) => request<Location[]>(`/locations/nearby?lat=${lat}&lng=${lng}&limit=${limit}`),
  adminLocations: () => request<Location[]>("/admin/locations"),
  adminLocation: (id: string) => request<Location>(`/admin/locations/${id}`),
  createLocation: (data: LocationFormInput) => request<Location>("/admin/locations", body(data)),
  updateLocation: (id: string, data: LocationFormInput) => request<Location>(`/admin/locations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteLocation: (id: string) => request<null>(`/admin/locations/${id}`, { method: "DELETE" }),
  uploadGallery: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("photos", file));
    return request<Location>(`/admin/locations/${id}/gallery`, { method: "POST", body: formData });
  },
  uploadPanorama: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("panorama", file);
    return request<Location>(`/admin/locations/${id}/panorama`, { method: "POST", body: formData });
  },
  removePanorama: (id: string) => request<Location>(`/admin/locations/${id}/panorama`, { method: "DELETE" }),
  deletePhoto: (id: string, publicId: string) => request<Location>(`/admin/locations/${id}/gallery/${encodeURIComponent(publicId)}`, { method: "DELETE" }),
  baseRoute: (origin: Coordinate, destination: Coordinate) => request<{ baseRoute: RouteResult }>("/routes/base-route", body({ origin, destination })),
  alongRoute: (origin: Coordinate, destination: Coordinate, maxDetourMinutes: number) =>
    request<{ baseRoute: RouteResult; offices: AlongRouteOffice[] }>("/routes/along-route", body({ origin, destination, maxDetourMinutes })),
  multiOffice: (origin: Coordinate, officeIds: string[], destination?: Coordinate) =>
    request<{ route: RouteResult & { waypointOrder: number[] }; offices: Location[] }>("/routes/multi-office", body({ origin, officeIds, destination })),
  geocode: (query: string) => request<Array<Coordinate & { label: string }>>(`/routes/geocode?q=${encodeURIComponent(query)}`)
};
