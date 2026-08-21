"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Car,
  Clock3,
  ExternalLink,
  Footprints,
  Gauge,
  GripVertical,
  Lightbulb,
  LoaderCircle,
  LocateFixed,
  MapPin,
  MapPinned,
  Navigation,
  Plus,
  RefreshCw,
  Route,
  Search,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import styles from "@/app/route-planner/route-planner.module.css";
import { PujaWayHeader } from "@/components/pujaway/PujaWayHeader";
import { DynamicPujaTrailMap } from "@/components/trails/DynamicPujaTrailMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/services/api";
import type { Location } from "@/types/location";
import type { Coordinate, RouteResult, TravelMode } from "@/types/routing";
import { coordinatesOf, trailDirectionsUrl } from "@/utils/maps";

const MAX_STOPS = 6;

type TransportId = "WALKING" | "AUTO" | "CAB";

type TransportOption = {
  id: TransportId;
  label: string;
  description: string;
  icon: LucideIcon;
};

type TrailRouteInput = {
  key: string;
  points: Coordinate[];
  mode: TravelMode;
};

type TrailRouteData = {
  route: RouteResult;
  legs: RouteResult[];
};

const TRANSPORT_OPTIONS: TransportOption[] = [
  { id: "WALKING", label: "Walking", description: "Pedestrian route", icon: Footprints },
  { id: "AUTO", label: "Auto / E-Rickshaw", description: "Road-route estimate", icon: Navigation },
  { id: "CAB", label: "Cab / Car", description: "Driving route", icon: Car },
];

function photoOf(location: Location) {
  return location.photos.find((photo) => photo.url.trim().length > 0);
}

function locationLabel(location: Location) {
  return location.landmark || location.district || location.city || location.fullAddress;
}

function formatDistance(meters?: number) {
  if (meters == null) return "—";
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}

function formatDuration(seconds?: number) {
  if (seconds == null) return "—";
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function routeDifficulty(distanceMeters: number | undefined, mode: TravelMode) {
  if (distanceMeters == null) return "—";
  const distanceKm = distanceMeters / 1000;
  const limits = mode === "WALKING" ? [4, 8] : [12, 25];
  if (distanceKm <= limits[0]) return "Easy";
  if (distanceKm <= limits[1]) return "Moderate";
  return "Long";
}

function providerName(provider: RouteResult["provider"]) {
  return {
    google: "Google Routes",
    openrouteservice: "OpenRouteService",
    mock: "development routing",
  }[provider];
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

async function fetchTrailRoute(input: TrailRouteInput, signal: AbortSignal): Promise<TrailRouteData> {
  const legs = await Promise.all(
    input.points.slice(0, -1).map(async (point, index) =>
      (await api.baseRoute(point, input.points[index + 1], input.mode, signal)).baseRoute,
    ),
  );
  const approximationNotes = Array.from(
    new Set(legs.flatMap((leg) => leg.approximationNote ? [leg.approximationNote] : [])),
  );
  const route: RouteResult = {
    distanceMeters: legs.reduce((total, leg) => total + leg.distanceMeters, 0),
    durationSeconds: legs.reduce((total, leg) => total + leg.durationSeconds, 0),
    polyline: "",
    coordinates: legs.flatMap((leg, index) => index === 0 ? leg.coordinates : leg.coordinates.slice(1)),
    provider: legs[0].provider,
    isFallback: legs.some((leg) => leg.isFallback),
    isApproximation: legs.some((leg) => leg.isApproximation),
    approximationNote: approximationNotes.length > 0 ? approximationNotes.join(" ") : undefined,
  };
  return { route, legs };
}

function PlannerLoadingState() {
  return (
    <div className={styles.loadingState} role="status">
      <span className={styles.loadingSpinner} aria-hidden="true" />
      <div>
        <h1 id="trail-title">Loading Puja stops</h1>
        <p>Preparing the trail builder and map…</p>
      </div>
    </div>
  );
}

export function PujaTrailPlanner() {
  const geo = useGeolocation();
  const seededSelection = useRef(false);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const pickerSearchRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [transport, setTransport] = useState<TransportId>("WALKING");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const deferredPickerSearch = useDeferredValue(pickerSearch.trim().toLowerCase());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [startFromCurrentLocation, setStartFromCurrentLocation] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const locationsQuery = useQuery({
    queryKey: ["puja-trail-locations"],
    queryFn: () => api.listLocations("?featured=true"),
    retry: 2,
    staleTime: 60_000,
  });

  const eligibleLocations = useMemo(() => {
    const locations = locationsQuery.data ?? [];
    return locations.slice().sort((a, b) => {
      const featuredDifference = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (featuredDifference !== 0) return featuredDifference;
      return a.title.localeCompare(b.title);
    });
  }, [locationsQuery.data]);

  const defaultStopIds = useMemo(() => {
    const featured = eligibleLocations.filter((location) => location.featured);
    const candidates = featured.length > 0 ? featured : eligibleLocations;
    return candidates
      .slice(0, 6)
      .sort((a, b) => coordinatesOf(b).lat - coordinatesOf(a).lat)
      .map((location) => location._id);
  }, [eligibleLocations]);

  useEffect(() => {
    if (seededSelection.current || defaultStopIds.length === 0) return;
    seededSelection.current = true;
    setSelectedIds(defaultStopIds);
  }, [defaultStopIds]);

  useEffect(() => {
    if (!pickerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => pickerSearchRef.current?.focus());

    function handleDialogKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePicker();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = pickerSearchRef.current?.closest<HTMLElement>("[role='dialog']");
      const focusable = dialog
        ? Array.from(dialog.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), a[href]"))
        : [];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleDialogKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleDialogKeyboard);
    };
  }, [pickerOpen]);

  const locationById = useMemo(
    () => new Map(eligibleLocations.map((location) => [location._id, location])),
    [eligibleLocations],
  );
  const selectedLocations = useMemo(
    () => selectedIds.flatMap((id) => locationById.get(id) ?? []),
    [locationById, selectedIds],
  );
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const routeMode: TravelMode = transport === "WALKING" ? "WALKING" : "DRIVING";
  const activeOrigin = startFromCurrentLocation ? geo.position ?? undefined : undefined;

  const routeInput = useMemo<TrailRouteInput | null>(() => {
    if (selectedLocations.length === 0) return null;
    const selectedPoints = selectedLocations.map(coordinatesOf);
    const origin = activeOrigin ?? selectedPoints[0];
    const points = activeOrigin ? [activeOrigin, ...selectedPoints] : selectedPoints;
    if (points.length < 2) return null;

    return {
      key: `${routeMode}:${origin.lat.toFixed(6)},${origin.lng.toFixed(6)}:${selectedLocations.map((location) => location._id).join(",")}`,
      points,
      mode: routeMode,
    };
  }, [activeOrigin, routeMode, selectedLocations]);
  const debouncedRouteInput = useDebouncedValue(routeInput, 500);

  const routeQuery = useQuery({
    queryKey: ["puja-trail-route", debouncedRouteInput?.key],
    queryFn: ({ signal }) => fetchTrailRoute(debouncedRouteInput!, signal),
    enabled: Boolean(debouncedRouteInput),
    retry: false,
    staleTime: 30_000,
  });

  const routeIsSettling = routeInput?.key !== debouncedRouteInput?.key;
  const routeIsUpdating = Boolean(routeInput) && (routeIsSettling || routeQuery.isFetching);
  const hasCurrentRoute = Boolean(
    routeInput
    && debouncedRouteInput
    && routeInput.key === debouncedRouteInput.key
    && !routeQuery.isFetching
    && !routeQuery.isError,
  );
  const routeResult = hasCurrentRoute ? routeQuery.data?.route : undefined;
  const routeLegs = hasCurrentRoute ? routeQuery.data?.legs ?? [] : [];
  const availableLocations = useMemo(() => {
    return eligibleLocations.filter((location) => {
      if (selectedIdSet.has(location._id)) return false;
      if (!deferredPickerSearch) return true;
      const haystack = [location.title, location.fullAddress, location.region, locationLabel(location)]
        .join(" ")
        .toLowerCase();
      return haystack.includes(deferredPickerSearch);
    });
  }, [deferredPickerSearch, eligibleLocations, selectedIdSet]);

  const areaLabel = useMemo(() => {
    const regions = new Set(selectedLocations.map((location) => location.region));
    if (regions.size === 1) {
      const region = selectedLocations[0]?.region.toLowerCase();
      return region ? `${region[0].toUpperCase()}${region.slice(1)} Kolkata` : "Kolkata";
    }
    return "Kolkata";
  }, [selectedLocations]);

  const directionsHref = trailDirectionsUrl(
    selectedLocations.map(coordinatesOf),
    activeOrigin,
    routeMode,
  );
  const routeTip = selectedLocations.find((location) => location.visitTip)?.visitTip
    ?? "Check pandal hours and local traffic advisories before you set out.";

  function openPicker() {
    lastFocusedElement.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPickerOpen(true);
  }

  function closePicker() {
    setPickerOpen(false);
    setPickerSearch("");
    window.requestAnimationFrame(() => lastFocusedElement.current?.focus());
  }

  function addStop(location: Location) {
    if (selectedIds.length >= MAX_STOPS || selectedIdSet.has(location._id)) return;
    setSelectedIds((current) => [...current, location._id]);
    setAnnouncement(`${location.title} added as stop ${selectedIds.length + 1}.`);
  }

  function removeStop(location: Location) {
    setSelectedIds((current) => current.filter((id) => id !== location._id));
    setAnnouncement(`${location.title} removed from the trail.`);
  }

  function moveStop(location: Location, direction: -1 | 1) {
    const fromIndex = selectedIds.indexOf(location._id);
    const toIndex = fromIndex + direction;
    if (fromIndex < 0 || toIndex < 0 || toIndex >= selectedIds.length) return;
    const reordered = selectedIds.slice();
    [reordered[fromIndex], reordered[toIndex]] = [reordered[toIndex], reordered[fromIndex]];
    setSelectedIds(reordered);
    setAnnouncement(`${location.title} moved to stop ${toIndex + 1}.`);
  }

  function dropStop(event: DragEvent<HTMLLIElement>, targetId: string) {
    event.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    const fromIndex = selectedIds.indexOf(draggingId);
    const targetIndex = selectedIds.indexOf(targetId);
    if (fromIndex < 0 || targetIndex < 0) return;
    const reordered = selectedIds.slice();
    const [movedId] = reordered.splice(fromIndex, 1);
    reordered.splice(targetIndex, 0, movedId);
    setSelectedIds(reordered);
    setDraggingId(null);
    const movedLocation = locationById.get(movedId);
    setAnnouncement(`${movedLocation?.title ?? "Puja"} moved to stop ${targetIndex + 1}.`);
  }

  async function handleCurrentLocation() {
    if (startFromCurrentLocation) {
      setStartFromCurrentLocation(false);
      setAnnouncement("The route now starts at the first Puja.");
      return;
    }
    const position = await geo.requestLocation();
    if (!position) return;
    setStartFromCurrentLocation(true);
    setAnnouncement("The route now starts from your current location.");
  }

  return (
    <div className={styles.page}>
      <PujaWayHeader />
      <main id="main-content" className={styles.backdrop}>
        <div className={styles.backdropVeil} aria-hidden="true" />
        <section className={styles.planner} aria-labelledby="trail-title">
          {locationsQuery.isPending ? <PlannerLoadingState /> : null}
          {locationsQuery.isError ? (
            <div className={styles.errorState} role="alert">
              <MapPinned aria-hidden="true" />
              <div>
                <h1 id="trail-title">Puja Trails are temporarily unavailable</h1>
                <p>{locationsQuery.error.message || "The Puja list could not be loaded."}</p>
                <button type="button" onClick={() => locationsQuery.refetch()} disabled={locationsQuery.isFetching}>
                  <RefreshCw aria-hidden="true" /> Try again
                </button>
              </div>
            </div>
          ) : null}
          {locationsQuery.isSuccess && eligibleLocations.length === 0 ? (
            <div className={styles.errorState}>
              <Sparkles aria-hidden="true" />
              <div>
                <h1 id="trail-title">No published Pujas are ready for a trail</h1>
                <p>Active Puja records will appear here as soon as they are published.</p>
                <Link href="/locations">Explore all locations</Link>
              </div>
            </div>
          ) : null}

          {locationsQuery.isSuccess && eligibleLocations.length > 0 ? (
            <>
              <div className={styles.workspace}>
                <section className={styles.itineraryPanel} aria-label="Trail itinerary">
                  <div className={styles.itineraryHeader}>
                    <div>
                      <span className={styles.eyebrow}>Plan your pandal hopping</span>
                      <h1 id="trail-title">Your Puja Trail</h1>
                      <p>{areaLabel} · {selectedLocations.length} {selectedLocations.length === 1 ? "stop" : "stops"}</p>
                    </div>
                    <button className={styles.editButton} type="button" onClick={openPicker}>
                      <MapPin aria-hidden="true" /> Edit route
                    </button>
                  </div>

                  <div className={styles.orderNotice}>
                    <Route aria-hidden="true" />
                    <span><strong>Your selected order</strong> — drag stops or use the arrow controls.</span>
                  </div>

                  {selectedLocations.length === 0 ? (
                    <div className={styles.emptyTrail}>
                      <span><MapPinned aria-hidden="true" /></span>
                      <h2>Build your first Puja trail</h2>
                      <p>Add at least two Pujas to preview a route and travel estimate.</p>
                      <button type="button" onClick={openPicker}><Plus aria-hidden="true" /> Add Pujas</button>
                    </div>
                  ) : (
                    <ol className={styles.stopList} aria-label="Puja stops in visit order">
                      {selectedLocations.map((location, index) => {
                        const photo = photoOf(location);
                        const currentLocationOffset = activeOrigin ? 0 : -1;
                        const legIndex = index + currentLocationOffset;
                        const leg = legIndex >= 0 ? routeLegs[legIndex] : undefined;
                        const isStartingPoint = index === 0 && !activeOrigin;
                        const externalPhoto = photo?.url.startsWith("http://") || photo?.url.startsWith("https://");

                        return (
                          <li
                            key={location._id}
                            className={`${styles.stopItem} ${draggingId === location._id ? styles.dragging : ""}`}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => dropStop(event, location._id)}
                          >
                            <span className={styles.stopNumber}>{index + 1}</span>
                            <article className={styles.stopCard}>
                              <div className={styles.stopPhoto}>
                                {photo ? (
                                  <Image
                                    src={photo.url}
                                    alt=""
                                    fill
                                    sizes="96px"
                                    unoptimized={externalPhoto}
                                  />
                                ) : (
                                  <span aria-hidden="true">PW</span>
                                )}
                              </div>
                              <div className={styles.stopCopy}>
                                <Link href={`/locations/${encodeURIComponent(location.slug)}`}>{location.title}</Link>
                                <p>{locationLabel(location)}</p>
                                <div className={styles.legMeta}>
                                  {isStartingPoint ? (
                                    <><MapPin aria-hidden="true" /><strong>Starting point</strong></>
                                  ) : routeIsUpdating ? (
                                    <><LoaderCircle className={styles.spin} aria-hidden="true" /> Updating leg…</>
                                  ) : leg ? (
                                    <>
                                      {routeMode === "WALKING" ? <Footprints aria-hidden="true" /> : <Car aria-hidden="true" />}
                                      <span>{formatDistance(leg.distanceMeters)}</span>
                                      <span>{formatDuration(leg.durationSeconds)}</span>
                                    </>
                                  ) : (
                                    <><Route aria-hidden="true" /> Leg estimate unavailable</>
                                  )}
                                </div>
                              </div>
                              <div className={styles.stopActions}>
                                <span
                                  className={styles.dragHandle}
                                  draggable={selectedLocations.length > 1}
                                  onDragStart={(event) => {
                                    setDraggingId(location._id);
                                    event.dataTransfer.effectAllowed = "move";
                                    event.dataTransfer.setData("text/plain", location._id);
                                  }}
                                  onDragEnd={() => setDraggingId(null)}
                                  title={`Drag ${location.title} to reorder`}
                                >
                                  <GripVertical aria-hidden="true" />
                                </span>
                                <button type="button" onClick={() => moveStop(location, -1)} disabled={index === 0} aria-label={`Move ${location.title} up`}>
                                  <ArrowUp aria-hidden="true" />
                                </button>
                                <button type="button" onClick={() => moveStop(location, 1)} disabled={index === selectedLocations.length - 1} aria-label={`Move ${location.title} down`}>
                                  <ArrowDown aria-hidden="true" />
                                </button>
                                <button type="button" onClick={() => removeStop(location)} aria-label={`Remove ${location.title}`}>
                                  <X aria-hidden="true" />
                                </button>
                              </div>
                            </article>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  <div className={styles.itineraryActions}>
                    <button type="button" className={styles.addButton} onClick={openPicker} disabled={selectedLocations.length >= MAX_STOPS}>
                      <Plus aria-hidden="true" />
                      {selectedLocations.length >= MAX_STOPS ? `${MAX_STOPS}-stop limit reached` : "Add more Pujas"}
                    </button>
                    <button
                      type="button"
                      className={`${styles.locationButton} ${startFromCurrentLocation ? styles.locationActive : ""}`}
                      onClick={handleCurrentLocation}
                      disabled={geo.loading}
                    >
                      {geo.loading ? <LoaderCircle className={styles.spin} aria-hidden="true" /> : <LocateFixed aria-hidden="true" />}
                      {geo.loading
                        ? "Finding your location…"
                        : startFromCurrentLocation
                          ? "Use first Puja as start"
                          : "Start from my location"}
                    </button>
                    {geo.error ? <p className={styles.geoError} role="alert">{geo.error}</p> : null}
                  </div>
                </section>

                <section className={styles.mapPanel} aria-label="Route map and travel options" aria-busy={routeIsUpdating}>
                  <DynamicPujaTrailMap
                    stops={selectedLocations}
                    route={routeResult?.coordinates}
                    origin={activeOrigin}
                  />

                  <fieldset className={styles.transportCard}>
                    <legend>Route options</legend>
                    {TRANSPORT_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const selected = transport === option.id;
                      return (
                        <label key={option.id} className={selected ? styles.transportSelected : undefined}>
                          <input
                            type="radio"
                            name="transport"
                            value={option.id}
                            checked={selected}
                            onChange={() => setTransport(option.id)}
                          />
                          <span className={styles.radioMark} aria-hidden="true" />
                          <Icon aria-hidden="true" />
                          <span>
                            <strong>{option.label}</strong>
                            <small>{selected && routeResult ? formatDuration(routeResult.durationSeconds) : option.description}</small>
                          </span>
                        </label>
                      );
                    })}
                    <p className={styles.transportNote}>
                      {transport === "AUTO"
                        ? "Auto availability and traffic vary; the map uses the road-routing estimate."
                        : "Travel times are routing estimates and can change with traffic or festival crowds."}
                    </p>
                  </fieldset>

                  <div className={styles.mapStatus} aria-live="polite">
                    {routeIsUpdating ? (
                      <><LoaderCircle className={styles.spin} aria-hidden="true" /> Updating route…</>
                    ) : routeQuery.isError ? (
                      <>
                        <span>Route estimate unavailable: {routeQuery.error.message}</span>
                        <button type="button" onClick={() => routeQuery.refetch()}><RefreshCw aria-hidden="true" /> Retry</button>
                      </>
                    ) : routeResult ? (
                      <>
                        <span className={styles.liveDot} aria-hidden="true" />
                        {routeResult.isApproximation
                          ? routeResult.approximationNote || "Approximate route shown"
                          : `Route estimate from ${providerName(routeResult.provider)}`}
                      </>
                    ) : (
                      <><MapPinned aria-hidden="true" /> Add two Pujas to draw a route</>
                    )}
                  </div>
                </section>
              </div>

              <section className={styles.summarySection} aria-labelledby="route-summary-title">
                <div className={styles.summaryHeading}>
                  <span className={styles.eyebrow}>Your route at a glance</span>
                  <h2 id="route-summary-title">Trail summary</h2>
                </div>
                <div className={styles.summaryGrid}>
                  <div className={styles.metricCard}>
                    <Navigation aria-hidden="true" />
                    <span><small>Total distance</small><strong>{formatDistance(routeResult?.distanceMeters)}</strong></span>
                  </div>
                  <div className={styles.metricCard}>
                    <Clock3 aria-hidden="true" />
                    <span><small>{routeMode === "WALKING" ? "Estimated walking" : "Estimated road time"}</small><strong>{formatDuration(routeResult?.durationSeconds)}</strong></span>
                  </div>
                  <div className={styles.metricCard}>
                    <MapPinned aria-hidden="true" />
                    <span><small>Puja stops</small><strong>{selectedLocations.length}</strong></span>
                  </div>
                  <div className={styles.metricCard} title="Difficulty is based on the selected route's distance and travel mode.">
                    <Gauge aria-hidden="true" />
                    <span><small>Difficulty · distance-based</small><strong>{routeDifficulty(routeResult?.distanceMeters, routeMode)}</strong></span>
                  </div>
                  {directionsHref ? (
                    <a className={styles.startButton} href={directionsHref} target="_blank" rel="noreferrer">
                      <span><Navigation aria-hidden="true" /></span>
                      <strong>Start this route</strong>
                      <small>Open the selected order in Google Maps <ExternalLink aria-hidden="true" /></small>
                    </a>
                  ) : (
                    <button className={styles.startButton} type="button" disabled>
                      <span><Navigation aria-hidden="true" /></span>
                      <strong>Start this route</strong>
                      <small>Add a Puja to continue</small>
                    </button>
                  )}
                </div>
                <div className={styles.tipBanner}>
                  <Lightbulb aria-hidden="true" />
                  <p><strong>Before you go:</strong> {routeTip}</p>
                </div>
              </section>
            </>
          ) : null}
        </section>
        <p className={styles.srOnly} aria-live="polite">{announcement}</p>
      </main>

      {pickerOpen ? (
        <div
          className={styles.pickerBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePicker();
          }}
        >
          <section className={styles.pickerDialog} role="dialog" aria-modal="true" aria-labelledby="picker-title">
            <div className={styles.pickerHeader}>
              <div>
                <span className={styles.eyebrow}>Curate your trail</span>
                <h2 id="picker-title">Add Puja stops</h2>
                <p>Choose up to {MAX_STOPS} published Pujas. New stops are added to the end of your route.</p>
              </div>
              <button type="button" onClick={closePicker} aria-label="Close Puja picker"><X aria-hidden="true" /></button>
            </div>
            <label className={styles.pickerSearch}>
              <Search aria-hidden="true" />
              <span className={styles.srOnly}>Search available Pujas</span>
              <input
                ref={pickerSearchRef}
                value={pickerSearch}
                onChange={(event) => setPickerSearch(event.target.value)}
                placeholder="Search by Puja, area, or region"
              />
              {pickerSearch ? <button type="button" onClick={() => setPickerSearch("")} aria-label="Clear search"><X aria-hidden="true" /></button> : null}
            </label>
            <div className={styles.pickerResults}>
              {availableLocations.length > 0 ? availableLocations.map((location) => {
                const photo = photoOf(location);
                const externalPhoto = photo?.url.startsWith("http://") || photo?.url.startsWith("https://");
                return (
                  <article key={location._id} className={styles.pickerCard}>
                    <div className={styles.pickerPhoto}>
                      {photo ? <Image src={photo.url} alt="" fill sizes="88px" unoptimized={externalPhoto} /> : <span aria-hidden="true">PW</span>}
                    </div>
                    <div>
                      <span>{location.region.toLowerCase()}</span>
                      <h3>{location.title}</h3>
                      <p><MapPin aria-hidden="true" /> {locationLabel(location)}</p>
                    </div>
                    <button type="button" onClick={() => addStop(location)} disabled={selectedIds.length >= MAX_STOPS}>
                      <Plus aria-hidden="true" /> Add
                    </button>
                  </article>
                );
              }) : (
                <div className={styles.noPickerResults}>
                  <Search aria-hidden="true" />
                  <p>{pickerSearch ? "No available Pujas match your search." : "Every published Puja is already in your trail."}</p>
                </div>
              )}
            </div>
            <div className={styles.pickerFooter}>
              <span>{selectedIds.length} of {MAX_STOPS} stops selected</span>
              <button type="button" onClick={closePicker}>Done</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
