import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import styles from "@/app/pujaway.module.css";
import type { Location, Region } from "@/types/location";

export type PujaCardData = {
  slug: string;
  title: string;
  locationLabel: string;
  region: Region | string;
  image?: string;
  imageAlt?: string;
  monochrome?: boolean;
};

export type PujaCardProps = {
  puja: PujaCardData;
  className?: string;
  headingLevel?: 2 | 3;
};

type PujaCardOverrides = Partial<
  Pick<PujaCardData, "locationLabel" | "image" | "imageAlt" | "monochrome">
>;

function formatRegion(region: string) {
  return region.charAt(0).toUpperCase() + region.slice(1).toLowerCase();
}

export function pujaCardDataFromLocation(
  location: Location,
  overrides: PujaCardOverrides = {},
): PujaCardData {
  const primaryPhoto = location.photos.find((photo) => photo.url.trim().length > 0);

  return {
    slug: location.slug,
    title: location.title,
    locationLabel: overrides.locationLabel ?? location.landmark ?? location.city,
    region: location.region,
    image: overrides.image ?? primaryPhoto?.url,
    imageAlt: overrides.imageAlt ?? primaryPhoto?.alt ?? `${location.title} Durga Puja pandal`,
    monochrome: overrides.monochrome,
  };
}

export function PujaCard({ puja, className, headingLevel = 3 }: PujaCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const externalImage = puja.image?.startsWith("http://") || puja.image?.startsWith("https://");

  return (
    <Link
      href={`/locations/${encodeURIComponent(puja.slug)}`}
      className={`${styles.pujaCard} ${className ?? ""}`}
      aria-label={`View ${puja.title} in ${puja.locationLabel}`}
    >
      {puja.image ? (
        <Image
          src={puja.image}
          alt={puja.imageAlt ?? `${puja.title} Durga Puja pandal`}
          fill
          sizes="(max-width: 720px) 92vw, (max-width: 1100px) 45vw, 390px"
          className={`${styles.pujaImage} ${puja.monochrome ? styles.monochrome : ""}`}
          unoptimized={externalImage}
        />
      ) : (
        <span className={styles.pujaImageFallback} aria-hidden="true">
          PujaWay
        </span>
      )}
      <span className={styles.regionBadge}>{formatRegion(puja.region)}</span>
      <span className={styles.cardShade} aria-hidden="true" />
      <span className={styles.pujaCardCopy}>
        <Heading>{puja.title}</Heading>
        <span className={styles.pujaCardLocation}>
          <MapPin aria-hidden="true" />
          <span>{puja.locationLabel}</span>
        </span>
      </span>
    </Link>
  );
}
