import type { Metadata } from "next";
import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { PujaWayHome } from "@/components/PujaWayHome";
import {
  pujaCardDataFromLocation,
  type PujaCardData,
} from "@/components/pujaway/PujaCard";
import { getFeaturedPujas } from "@/services/puja-data";

const pageTitle = "PujaWay — Discover Kolkata's Durga Puja";
const pageDescription =
  "Find nearby pujas, explore Kolkata's most-loved pandals, and build your own Puja route with PujaWay.";
const preferredFeaturedPujaSlugs = [
  "ekdalia-evergreen",
  "triangular-park",
  "shyambazar-sarbojanin",
  "santosh-mitra-square",
] as const;
const monochromeFeaturedPujaSlugs = new Set<string>([
  "ekdalia-evergreen",
  "santosh-mitra-square",
]);

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost ?? requestHeaders.get("host") ?? "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = new URL("/og.png", origin).toString();

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: origin },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: origin,
      siteName: "PujaWay",
      locale: "bn_IN",
      type: "website",
      images: [{ url: socialImage, width: 1731, height: 909, alt: "PujaWay — Your Guide To Puja Hopping" }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [socialImage],
    },
  };
}

export default async function Home() {
  let featuredPujas: PujaCardData[] = [];
  let featuredLoadFailed = false;

  try {
    const featuredLocations = await getFeaturedPujas(preferredFeaturedPujaSlugs);
    featuredPujas = featuredLocations.map((location) =>
      pujaCardDataFromLocation(location, {
        monochrome: monochromeFeaturedPujaSlugs.has(location.slug),
      }),
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("Unable to load featured Puja locations for the homepage.", error);
    featuredLoadFailed = true;
  }

  return (
    <PujaWayHome
      featuredPujas={featuredPujas}
      featuredLoadFailed={featuredLoadFailed}
    />
  );
}
