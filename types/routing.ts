export type Coordinate = { lat: number; lng: number };

export type TravelMode = "WALKING" | "DRIVING";

export type RouteResult = {
  distanceMeters: number;
  durationSeconds: number;
  polyline: string;
  coordinates: Coordinate[];
  provider: "google" | "openrouteservice" | "mock";
  isFallback: boolean;
  isApproximation: boolean;
  approximationNote?: string;
};

export type AlongRouteOffice = {
  id: string;
  title: string;
  slug: string;
  fullAddress: string;
  location: Coordinate;
  progressKm: number;
  detourMinutes: number;
  detourMeters: number;
  order: number;
};
