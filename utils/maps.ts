import type { Coordinate } from "@/types/routing";

export const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const attribution = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || "&copy; OpenStreetMap contributors";

export function coordinatesOf(location: { location: { coordinates: [number, number] } }): Coordinate {
  return { lng: location.location.coordinates[0], lat: location.location.coordinates[1] };
}

export function directionsUrl(destination: Coordinate, origin?: Coordinate) {
  const base = "https://www.google.com/maps/dir/?api=1";
  const originPart = origin ? `&origin=${origin.lat},${origin.lng}` : "";
  return `${base}${originPart}&destination=${destination.lat},${destination.lng}`;
}

export function km(meters?: number) {
  if (meters == null) return "";
  return `${(meters / 1000).toFixed(1)} km`;
}
