"use client";

import L from "leaflet";
import { Flag, MapPin, Navigation } from "lucide-react";
import { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import Link from "next/link";
import type { Location } from "@/types/location";
import type { Coordinate } from "@/types/routing";
import { attribution, coordinatesOf, directionsUrl, tileUrl } from "@/utils/maps";

const markerBaseClass =
  "flex h-11 w-11 items-center justify-center rounded-full border-2 border-white shadow-lg";

function markerIcon(type: "office" | "origin" | "destination") {
  const config = {
    office: { icon: MapPin, className: "bg-emerald-600 text-white" },
    origin: { icon: Navigation, className: "bg-slate-950 text-white" },
    destination: { icon: Flag, className: "bg-rose-600 text-white" }
  }[type];
  const Icon = config.icon;

  return L.divIcon({
    className: "",
    html: renderToStaticMarkup(
      <div className={`${markerBaseClass} ${config.className}`}>
        <Icon size={20} strokeWidth={2.6} />
      </div>
    ),
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -42]
  });
}

const officeIcon = markerIcon("office");
const originIcon = markerIcon("origin");
const destinationIcon = markerIcon("destination");

type Props = {
  offices?: Location[];
  center?: Coordinate;
  route?: Coordinate[];
  origin?: Coordinate;
  destination?: Coordinate;
  originLabel?: string;
  destinationLabel?: string;
  className?: string;
  ariaLabel?: string;
  onMapClick?: (point: Coordinate) => void;
};

function ClickHandler({ onMapClick }: { onMapClick?: (point: Coordinate) => void }) {
  useMapEvents({
    click(event) {
      onMapClick?.({ lat: event.latlng.lat, lng: event.latlng.lng });
    }
  });
  return null;
}

function MapViewport({ center, route, origin, destination }: Pick<Props, "center" | "route" | "origin" | "destination">) {
  const map = useMap();

  useEffect(() => {
    const points = route && route.length > 0
      ? route
      : [origin, destination, center].filter((point): point is Coordinate => Boolean(point));

    if (points.length > 1) {
      map.fitBounds(points.map((point) => [point.lat, point.lng]), { padding: [32, 32], maxZoom: 15 });
    } else if (points[0]) {
      map.setView([points[0].lat, points[0].lng], 14);
    }
  }, [center, destination, map, origin, route]);

  return null;
}

export function OfficeMap({
  offices = [],
  center,
  route,
  origin,
  destination,
  originLabel = "Your location",
  destinationLabel = "Destination",
  className,
  ariaLabel = "Interactive location map",
  onMapClick
}: Props) {
  const firstOffice = offices[0];
  const mapCenter = center ?? origin ?? destination ?? (firstOffice ? coordinatesOf(firstOffice) : { lat: 22.5726, lng: 88.3639 });
  const mapClassName = className || "h-[360px]";

  return (
    <div role="region" aria-label={ariaLabel}>
      <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={14} scrollWheelZoom className={mapClassName}>
        <TileLayer attribution={attribution} url={tileUrl} />
        <ClickHandler onMapClick={onMapClick} />
        <MapViewport center={center} route={route} origin={origin} destination={destination} />
        {origin ? <Marker icon={originIcon} position={[origin.lat, origin.lng]}><Popup>{originLabel}</Popup></Marker> : null}
        {destination ? <Marker icon={destinationIcon} position={[destination.lat, destination.lng]}><Popup>{destinationLabel}</Popup></Marker> : null}
        {offices.map((office) => {
          const point = coordinatesOf(office);
          return (
            <Marker key={office._id} icon={officeIcon} position={[point.lat, point.lng]}>
              <Popup>
                <div className="space-y-2">
                  <strong>{office.title}</strong>
                  <p>{office.fullAddress}</p>
                  <Link href={`/locations/${office.slug}`}>View</Link>{" "}
                  <a href={directionsUrl(point)} target="_blank" rel="noreferrer">Directions</a>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {route && route.length > 1 ? <Polyline positions={route.map((point) => [point.lat, point.lng])} /> : null}
      </MapContainer>
    </div>
  );
}
