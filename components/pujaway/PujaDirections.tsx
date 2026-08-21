"use client";

import { Car, ExternalLink, Footprints, LocateFixed, MapPin, Navigation, Route as RouteIcon } from "lucide-react";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { DynamicOfficeMap } from "@/components/maps/DynamicOfficeMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/services/api";
import type { Coordinate, RouteResult, TravelMode } from "@/types/routing";
import { directionsUrl } from "@/utils/maps";
import styles from "./PujaDirections.module.css";

type TransportId = "WALKING" | "AUTO" | "CAB";

type RouteRecord = {
  key: string;
  result: RouteResult;
};

type RouteErrorRecord = {
  key: string;
  message: string;
};

type PujaRouteContextValue = {
  destination: Coordinate;
  destinationLabel: string;
  origin: Coordinate | null;
  geolocationError: string;
  geolocationLoading: boolean;
  requestLocation: () => void;
  retryRoutes: () => void;
  transport: TransportId;
  setTransport: (transport: TransportId) => void;
  walkingRoute?: RouteResult;
  drivingRoute?: RouteResult;
  walkingLoading: boolean;
  drivingLoading: boolean;
  walkingError: string;
  drivingError: string;
};

const PujaRouteContext = createContext<PujaRouteContextValue | null>(null);

const TRANSPORT_OPTIONS: ReadonlyArray<{
  id: TransportId;
  mode: TravelMode;
  label: string;
  note: string;
  icon: typeof Footprints;
}> = [
  { id: "WALKING", mode: "WALKING", label: "Walk", note: "Walking estimate", icon: Footprints },
  { id: "AUTO", mode: "DRIVING", label: "Auto / E-Rickshaw", note: "Driving-route estimate", icon: RouteIcon },
  { id: "CAB", mode: "DRIVING", label: "Cab", note: "Driving-route estimate", icon: Car }
];

export type PujaRouteProviderProps = {
  destination: Coordinate;
  destinationLabel: string;
  children: ReactNode;
};

export type PujaTravelFactsProps = {
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  noteClassName?: string;
  iconClassName?: string;
};

export type PujaDirectionsProps = {
  className?: string;
  heading?: string;
  mapAriaLabel?: string;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function transportMode(transport: TransportId): TravelMode {
  return transport === "WALKING" ? "WALKING" : "DRIVING";
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.max(1, Math.round(meters))} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

function providerLabel(provider: RouteResult["provider"]) {
  if (provider === "google") return "Google";
  if (provider === "openrouteservice") return "OpenRouteService";
  return "development fallback";
}

function routeKey(origin: Coordinate, destination: Coordinate, mode: TravelMode) {
  return `${origin.lat.toFixed(6)},${origin.lng.toFixed(6)}:${destination.lat.toFixed(6)},${destination.lng.toFixed(6)}:${mode}`;
}

function routeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) return `Route unavailable: ${error.message}`;
  return "Route unavailable right now. Please try again or open Google Maps.";
}

function usePujaRoute() {
  const value = useContext(PujaRouteContext);
  if (!value) throw new Error("Puja route components must be rendered inside PujaRouteProvider.");
  return value;
}

export function PujaRouteProvider({ destination, destinationLabel, children }: PujaRouteProviderProps) {
  const geolocation = useGeolocation();
  const [transport, setTransport] = useState<TransportId>("WALKING");
  const [routes, setRoutes] = useState<Partial<Record<TravelMode, RouteRecord>>>({});
  const [routeErrors, setRouteErrors] = useState<Partial<Record<TravelMode, RouteErrorRecord>>>({});
  const [loadingKeys, setLoadingKeys] = useState<Partial<Record<TravelMode, string>>>({});
  const [retrySequence, setRetrySequence] = useState(0);
  const routeCache = useRef(new Map<string, RouteResult>());
  const inFlightRoutes = useRef(new Map<string, Promise<RouteResult>>());
  const origin = geolocation.position;
  const originLat = origin?.lat;
  const originLng = origin?.lng;
  const destinationLat = destination.lat;
  const destinationLng = destination.lng;

  useEffect(() => {
    if (originLat == null || originLng == null) return;

    const currentOrigin = { lat: originLat, lng: originLng };
    const currentDestination = { lat: destinationLat, lng: destinationLng };
    const modes: TravelMode[] = ["WALKING", "DRIVING"];
    let active = true;

    for (const mode of modes) {
      const key = routeKey(currentOrigin, currentDestination, mode);
      const cached = routeCache.current.get(key);

      if (cached) {
        setRoutes((current) => ({ ...current, [mode]: { key, result: cached } }));
        setLoadingKeys((current) => ({ ...current, [mode]: undefined }));
        continue;
      }

      setLoadingKeys((current) => ({ ...current, [mode]: key }));
      setRouteErrors((current) => ({ ...current, [mode]: undefined }));

      let request = inFlightRoutes.current.get(key);
      if (!request) {
        request = api.baseRoute(currentOrigin, currentDestination, mode).then((response) => response.baseRoute);
        inFlightRoutes.current.set(key, request);
        void request.then(
          () => inFlightRoutes.current.delete(key),
          () => inFlightRoutes.current.delete(key)
        );
      }

      void request.then(
        (result) => {
          routeCache.current.set(key, result);
          if (!active) return;
          setRoutes((current) => ({ ...current, [mode]: { key, result } }));
          setLoadingKeys((current) => current[mode] === key ? { ...current, [mode]: undefined } : current);
        },
        (error: unknown) => {
          if (!active) return;
          setRouteErrors((current) => ({ ...current, [mode]: { key, message: routeErrorMessage(error) } }));
          setLoadingKeys((current) => current[mode] === key ? { ...current, [mode]: undefined } : current);
        }
      );
    }

    return () => {
      active = false;
    };
  }, [destinationLat, destinationLng, originLat, originLng, retrySequence]);

  const walkingKey = origin ? routeKey(origin, destination, "WALKING") : "";
  const drivingKey = origin ? routeKey(origin, destination, "DRIVING") : "";
  const walkingRoute = routes.WALKING?.key === walkingKey ? routes.WALKING.result : undefined;
  const drivingRoute = routes.DRIVING?.key === drivingKey ? routes.DRIVING.result : undefined;
  const walkingError = routeErrors.WALKING?.key === walkingKey ? routeErrors.WALKING.message : "";
  const drivingError = routeErrors.DRIVING?.key === drivingKey ? routeErrors.DRIVING.message : "";

  const value: PujaRouteContextValue = {
    destination,
    destinationLabel,
    origin,
    geolocationError: geolocation.error,
    geolocationLoading: geolocation.loading,
    requestLocation: geolocation.requestLocation,
    retryRoutes: () => setRetrySequence((current) => current + 1),
    transport,
    setTransport,
    walkingRoute,
    drivingRoute,
    walkingLoading: Boolean(walkingKey && loadingKeys.WALKING === walkingKey),
    drivingLoading: Boolean(drivingKey && loadingKeys.DRIVING === drivingKey),
    walkingError,
    drivingError
  };

  return <PujaRouteContext.Provider value={value}>{children}</PujaRouteContext.Provider>;
}

export function PujaTravelFacts({
  className,
  labelClassName,
  valueClassName,
  noteClassName,
  iconClassName
}: PujaTravelFactsProps) {
  const route = usePujaRoute();
  const waitingForWalkingRoute = route.geolocationLoading || route.walkingLoading;
  const distanceValue = route.walkingRoute ? formatDistance(route.walkingRoute.distanceMeters) : null;
  const durationValue = route.walkingRoute ? formatDuration(route.walkingRoute.durationSeconds) : null;
  const locationNote = route.geolocationError
    || route.walkingError
    || (route.walkingRoute?.isApproximation ? "Straight-line development approximation; not for navigation." : "");

  return (
    <>
      <div className={joinClassNames(styles.factCell, className)}>
        <Navigation className={joinClassNames(styles.factIcon, iconClassName)} aria-hidden="true" />
        <div>
          <span className={joinClassNames(styles.factLabel, labelClassName)}>Distance</span>
          {!route.origin && !route.geolocationLoading ? (
            <button
              type="button"
              className={joinClassNames(styles.factLocationButton, valueClassName)}
              onClick={route.requestLocation}
            >
              Use your location
            </button>
          ) : route.walkingError && route.origin ? (
            <button
              type="button"
              className={joinClassNames(styles.factLocationButton, valueClassName)}
              onClick={route.retryRoutes}
            >
              Retry route
            </button>
          ) : (
            <strong className={joinClassNames(styles.factValue, valueClassName)} aria-live="polite">
              {distanceValue || (waitingForWalkingRoute ? "Calculating…" : "Unavailable")}
            </strong>
          )}
          {locationNote ? <span className={joinClassNames(styles.factNote, noteClassName)}>{locationNote}</span> : null}
        </div>
      </div>

      <div className={joinClassNames(styles.factCell, className)}>
        <Footprints className={joinClassNames(styles.factIcon, iconClassName)} aria-hidden="true" />
        <div>
          <span className={joinClassNames(styles.factLabel, labelClassName)}>Walk time</span>
          <strong className={joinClassNames(styles.factValue, valueClassName)} aria-live="polite">
            {durationValue || (waitingForWalkingRoute ? "Calculating…" : route.origin ? "Unavailable" : "Use location first")}
          </strong>
          {!route.origin && !route.geolocationError ? (
            <span className={joinClassNames(styles.factNote, noteClassName)}>Calculated only after you choose to share your location.</span>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function PujaDirections({ className, heading = "Location & Directions", mapAriaLabel }: PujaDirectionsProps) {
  const route = usePujaRoute();
  const radioGroupName = useId();
  const selectedMode = transportMode(route.transport);
  const selectedRoute = selectedMode === "WALKING" ? route.walkingRoute : route.drivingRoute;
  const selectedLoading = selectedMode === "WALKING" ? route.walkingLoading : route.drivingLoading;
  const selectedError = selectedMode === "WALKING" ? route.walkingError : route.drivingError;

  return (
    <section className={joinClassNames(styles.directions, className)} aria-label={heading || "Location and directions"}>
      {heading ? (
        <h2 className={styles.heading}>
          <MapPin aria-hidden="true" />
          {heading}
        </h2>
      ) : null}

      <div className={styles.mapFrame}>
        <DynamicOfficeMap
          center={route.destination}
          origin={route.origin || undefined}
          originLabel="Your location"
          destination={route.destination}
          destinationLabel={route.destinationLabel}
          route={selectedRoute?.coordinates}
          className={styles.map}
          ariaLabel={mapAriaLabel || `Map showing ${route.destinationLabel}`}
        />
      </div>

      <div className={styles.routePoints}>
        <div className={styles.pointRow}>
          <span className={styles.originDot} aria-hidden="true" />
          <div>
            <strong>Your location</strong>
            <span>{route.origin ? `${route.origin.lat.toFixed(5)}, ${route.origin.lng.toFixed(5)}` : "Shared only when you request directions"}</span>
          </div>
          {!route.origin ? (
            <button type="button" onClick={route.requestLocation} disabled={route.geolocationLoading}>
              <LocateFixed aria-hidden="true" />
              {route.geolocationLoading ? "Finding you…" : "Use my location"}
            </button>
          ) : null}
        </div>
        <span className={styles.connector} aria-hidden="true">↓</span>
        <div className={styles.pointRow}>
          <MapPin className={styles.destinationIcon} aria-hidden="true" />
          <div>
            <strong>{route.destinationLabel}</strong>
            <span>{route.destination.lat.toFixed(5)}, {route.destination.lng.toFixed(5)}</span>
          </div>
        </div>
      </div>

      {route.geolocationError ? <p className={styles.error} role="alert">{route.geolocationError}</p> : null}

      <fieldset className={styles.transportFieldset} disabled={!route.origin}>
        <legend>Choose transport</legend>
        <div className={styles.transportGrid} role="radiogroup" aria-label="Transport estimate">
          {TRANSPORT_OPTIONS.map((option) => {
            const optionRoute = option.mode === "WALKING" ? route.walkingRoute : route.drivingRoute;
            const optionLoading = option.mode === "WALKING" ? route.walkingLoading : route.drivingLoading;
            const optionError = option.mode === "WALKING" ? route.walkingError : route.drivingError;
            const Icon = option.icon;
            return (
              <label key={option.id} className={styles.transportOption} data-selected={route.transport === option.id ? "true" : "false"}>
                <input
                  type="radio"
                  name={radioGroupName}
                  value={option.id}
                  checked={route.transport === option.id}
                  onChange={() => route.setTransport(option.id)}
                />
                <span className={styles.transportLabel}><Icon aria-hidden="true" />{option.label}</span>
                <strong>{optionRoute ? formatDuration(optionRoute.durationSeconds) : optionLoading ? "Calculating…" : optionError ? "Unavailable" : "Use location"}</strong>
                <span>{optionRoute ? formatDistance(optionRoute.distanceMeters) : option.note}</span>
                <small>
                  {optionRoute?.isApproximation
                    ? "Straight-line development approximation"
                    : optionRoute
                      ? `${providerLabel(optionRoute.provider)} route estimate`
                      : option.note}
                </small>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className={styles.summary} aria-live="polite">
        {selectedRoute?.isApproximation ? (
          <p>
            Development fallback only: straight-line distance <strong>{formatDistance(selectedRoute.distanceMeters)}</strong> with a fixed-speed time approximation of <strong>{formatDuration(selectedRoute.durationSeconds)}</strong>. {selectedRoute.approximationNote}
          </p>
        ) : selectedRoute ? (
          <p>
            Estimated {route.transport === "WALKING" ? "walking" : "driving-route"} journey from {providerLabel(selectedRoute.provider)}: <strong>{formatDistance(selectedRoute.distanceMeters)}</strong> in approximately <strong>{formatDuration(selectedRoute.durationSeconds)}</strong>.
            {route.transport === "AUTO" || route.transport === "CAB" ? " Auto/E-Rickshaw and Cab share the same provider-backed driving estimate." : ""}
          </p>
        ) : selectedLoading ? (
          <p>Calculating the selected route…</p>
        ) : selectedError ? (
          <p className={styles.error}>{selectedError}</p>
        ) : (
          <p>Choose “Use my location” to calculate distance and estimated travel time.</p>
        )}
      </div>

      {selectedError && route.origin ? (
        <button type="button" className={styles.retryButton} onClick={route.retryRoutes}>Retry route</button>
      ) : null}

      <a
        className={styles.googleMapsLink}
        href={directionsUrl(route.destination, route.origin || undefined, selectedMode)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open directions in Google Maps
        <ExternalLink aria-hidden="true" />
      </a>
    </section>
  );
}
