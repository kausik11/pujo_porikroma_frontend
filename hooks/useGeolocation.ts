"use client";

import { useState } from "react";
import type { Coordinate } from "@/types/routing";

export function useGeolocation() {
  const [position, setPosition] = useState<Coordinate | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function requestLocation(): Promise<Coordinate | null> {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return Promise.resolve(null);
    }
    setLoading(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (result) => {
          const nextPosition = { lat: result.coords.latitude, lng: result.coords.longitude };
          setPosition(nextPosition);
          setLoading(false);
          resolve(nextPosition);
        },
        (geoError) => {
          const message = {
            [geoError.PERMISSION_DENIED]: "Location permission was denied. You can still open the pandal in Google Maps.",
            [geoError.POSITION_UNAVAILABLE]: "Your current location is unavailable. Check your device location settings and try again.",
            [geoError.TIMEOUT]: "Finding your location took too long. Please try again."
          }[geoError.code] ?? "Unable to read your current location.";
          setError(message);
          setLoading(false);
          resolve(null);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  return { position, error, loading, requestLocation };
}
