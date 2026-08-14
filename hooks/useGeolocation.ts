"use client";

import { useState } from "react";
import type { Coordinate } from "@/types/routing";

export function useGeolocation() {
  const [position, setPosition] = useState<Coordinate | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function requestLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({ lat: result.coords.latitude, lng: result.coords.longitude });
        setLoading(false);
      },
      (geoError) => {
        setError(geoError.code === geoError.PERMISSION_DENIED ? "Location permission was denied." : "Unable to read your current location.");
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  return { position, error, loading, requestLocation };
}
