"use client";

import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import styles from "@/app/route-planner/route-planner.module.css";
import type { Location } from "@/types/location";
import type { Coordinate } from "@/types/routing";
import { attribution, coordinatesOf } from "@/utils/maps";
import { tileUrl } from "@/utils/maps";

type PujaTrailMapProps = {
  stops: Location[];
  route?: Coordinate[];
  origin?: Coordinate;
};

const stopIconCache = new Map<number, L.DivIcon>();

function stopIcon(order: number) {
  const cached = stopIconCache.get(order);
  if (cached) return cached;

  const icon = L.divIcon({
    className: "",
    html: `<span class="${styles.numberedMarker}" aria-hidden="true"><b>${order}</b></span>`,
    iconSize: [44, 52],
    iconAnchor: [22, 50],
    popupAnchor: [0, -48],
  });
  stopIconCache.set(order, icon);
  return icon;
}

const originIcon = L.divIcon({
  className: "",
  html: `<span class="${styles.originMarker}" aria-hidden="true"><span></span></span>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

function MapViewport({ stops, route, origin }: PujaTrailMapProps) {
  const map = useMap();
  const stopKey = stops.map((stop) => stop._id).join(",");

  useEffect(() => {
    const points = route && route.length > 1
      ? route
      : [origin, ...stops.map(coordinatesOf)].filter((point): point is Coordinate => Boolean(point));

    if (points.length > 1) {
      map.fitBounds(points.map((point) => [point.lat, point.lng]), {
        paddingTopLeft: [36, 36],
        paddingBottomRight: [36, 36],
        maxZoom: 15,
      });
    } else if (points[0]) {
      map.setView([points[0].lat, points[0].lng], 14);
    }
  }, [map, origin, route, stopKey, stops]);

  return null;
}

export function PujaTrailMap({ stops, route, origin }: PujaTrailMapProps) {
  const firstStop = stops[0];
  const fallbackCenter = firstStop ? coordinatesOf(firstStop) : { lat: 22.5726, lng: 88.3639 };
  const center = origin ?? fallbackCenter;

  return (
    <div className={styles.mapRegion} role="region" aria-label={`Interactive map of ${stops.length} Puja trail stops`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className={styles.mapCanvas}
      >
        <TileLayer attribution={attribution} url={tileUrl} />
        <MapViewport stops={stops} route={route} origin={origin} />
        {origin ? (
          <Marker icon={originIcon} position={[origin.lat, origin.lng]}>
            <Popup>Your current location</Popup>
          </Marker>
        ) : null}
        {stops.map((stop, index) => {
          const point = coordinatesOf(stop);
          return (
            <Marker key={stop._id} icon={stopIcon(index + 1)} position={[point.lat, point.lng]}>
              <Popup>
                <div className={styles.mapPopup}>
                  <strong>Stop {index + 1}: {stop.title}</strong>
                  <span>{stop.fullAddress}</span>
                  <Link href={`/locations/${encodeURIComponent(stop.slug)}`}>View Puja details</Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {route && route.length > 1 ? (
          <>
            <Polyline
              positions={route.map((point) => [point.lat, point.lng])}
              pathOptions={{ color: "#fff8e8", weight: 8, opacity: 0.92 }}
            />
            <Polyline
              positions={route.map((point) => [point.lat, point.lng])}
              pathOptions={{ color: "#981b25", weight: 4, opacity: 1, dashArray: "10 11" }}
            />
          </>
        ) : null}
      </MapContainer>
    </div>
  );
}
