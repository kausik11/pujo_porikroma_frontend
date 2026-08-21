import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
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

const cardClassName =
  "group relative isolate block h-[494px] overflow-hidden rounded-[11px] bg-[#30291f] text-white no-underline shadow-[0_1px_0_rgb(0_0_0_/_14%)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#d51018] max-[720px]:h-[475px] max-[410px]:h-[440px]";
const imageClassName =
  "z-[-3] object-cover object-top transition-[transform,filter] duration-[450ms,300ms] group-hover:scale-[1.035]";
const fallbackClassName =
  "absolute inset-0 z-[-3] grid place-items-center bg-[radial-gradient(circle_at_50%_42%,rgb(244_206_105_/_23%),transparent_36%),repeating-conic-gradient(from_0deg_at_50%_50%,rgb(255_255_255_/_4%)_0_8deg,transparent_8deg_16deg),#30291f] text-[clamp(34px,5vw,58px)] tracking-[-2px] text-[rgb(255_247_231_/_74%)]";
const regionClassName =
  "absolute left-[26px] top-[18px] z-[2] rounded-full bg-[#ffe59e] px-[17px] pb-1.5 pt-[7px] text-[13px] font-[550] leading-none text-[#252017]";
const shadeClassName =
  "absolute inset-0 z-[-2] bg-[linear-gradient(180deg,transparent_40%,rgb(20_18_15_/_15%)_59%,rgb(28_26_22_/_89%)_78%,rgb(33_31_28_/_98%)),linear-gradient(90deg,rgb(0_0_0_/_4%),rgb(0_0_0_/_1%))]";
const copyClassName = "absolute inset-x-[27px] bottom-7 z-[2] block";
const titleClassName = "m-0 text-[27px] font-[520] leading-[1.15] tracking-[-0.8px]";
const locationClassName = "mt-[18px] flex items-center gap-3 text-[18px] leading-[1.2] text-[#f3efe6]";

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
      className={`${cardClassName} ${className ?? ""}`}
      aria-label={`View ${puja.title} in ${puja.locationLabel}`}
    >
      {puja.image ? (
        <Image
          src={puja.image}
          alt={puja.imageAlt ?? `${puja.title} Durga Puja pandal`}
          fill
          sizes="(max-width: 720px) 92vw, (max-width: 1100px) 45vw, 390px"
          className={`${imageClassName} ${puja.monochrome ? "grayscale contrast-[1.02]" : ""}`}
          unoptimized={externalImage}
        />
      ) : (
        <span className={fallbackClassName} aria-hidden="true">
          PujaWay
        </span>
      )}
      <span className={regionClassName}>{formatRegion(puja.region)}</span>
      <span className={shadeClassName} aria-hidden="true" />
      <span className={copyClassName}>
        <Heading className={titleClassName}>{puja.title}</Heading>
        <span className={locationClassName}>
          <MapPin aria-hidden="true" className="size-6 flex-none fill-[#ff4d5f] stroke-[#ff4d5f] text-[#ff4d5f]" />
          <span>{puja.locationLabel}</span>
        </span>
      </span>
    </Link>
  );
}
