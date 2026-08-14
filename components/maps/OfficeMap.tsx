"use client";

import L from "leaflet";
import { Flag, MapPin, Navigation } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from "react-leaflet";
import Link from "next/link";
import type { Location } from "@/types/location";
import type { Coordinate } from "@/types/routing";
import { attribution, coordinatesOf, directionsUrl, tileUrl } from "@/utils/maps";

const markerBaseClass =
  "flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-lg";

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
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34]
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

export function OfficeMap({ offices = [], center, route, origin, destination, onMapClick }: Props) {
  const mapCenter = center ?? origin ?? offices[0] ? (center ?? origin ?? coordinatesOf(offices[0])) : { lat: 22.5726, lng: 88.3639 };
  return (
    <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={12} scrollWheelZoom className="h-[360px]">
      <TileLayer attribution={attribution} url={tileUrl} />
      <ClickHandler onMapClick={onMapClick} />
      {origin && <Marker icon={originIcon} position={[origin.lat, origin.lng]}><Popup>Start</Popup></Marker>}
      {destination && <Marker icon={destinationIcon} position={[destination.lat, destination.lng]}><Popup>Destination</Popup></Marker>}
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
      {route && <Polyline positions={route.map((point) => [point.lat, point.lng])} />}
    </MapContainer>
  );
}
