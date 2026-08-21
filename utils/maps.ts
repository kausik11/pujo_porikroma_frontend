import type { Coordinate, TravelMode } from "@/types/routing";

export const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const attribution = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || "&copy; OpenStreetMap contributors";

export function coordinatesOf(location: { location: { coordinates: [number, number] } }): Coordinate {
  return { lng: location.location.coordinates[0], lat: location.location.coordinates[1] };
}

export function directionsUrl(destination: Coordinate, origin?: Coordinate, mode?: TravelMode) {
  const base = "https://www.google.com/maps/dir/?api=1";
  const originPart = origin ? `&origin=${origin.lat},${origin.lng}` : "";
  const modePart = mode ? `&travelmode=${mode.toLowerCase()}` : "";
  return `${base}${originPart}&destination=${destination.lat},${destination.lng}${modePart}`;
}

export function trailDirectionsUrl(stops: Coordinate[], origin?: Coordinate, mode: TravelMode = "WALKING") {
  if (stops.length === 0) return "";

  const destination = stops.at(-1)!;
  const routeOrigin = origin ?? (stops.length > 1 ? stops[0] : undefined);
  const waypoints = origin ? stops.slice(0, -1) : stops.slice(1, -1);
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    travelmode: mode.toLowerCase()
  });

  if (routeOrigin) params.set("origin", `${routeOrigin.lat},${routeOrigin.lng}`);
  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.map((point) => `${point.lat},${point.lng}`).join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function km(meters?: number) {
  if (meters == null) return "";
  return `${(meters / 1000).toFixed(1)} km`;
}
