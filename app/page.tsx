import type { Metadata } from "next";
import { Noto_Sans_Bengali, Noto_Serif_Bengali } from "next/font/google";
import { headers } from "next/headers";
import { PujaWayHome } from "@/components/PujaWayHome";

const bengaliSans = Noto_Sans_Bengali({
  variable: "--font-bengali-sans",
  subsets: ["bengali", "latin"],
  weight: "variable",
  display: "swap",
});

const bengaliSerif = Noto_Serif_Bengali({
  variable: "--font-bengali-serif",
  subsets: ["bengali", "latin"],
  weight: "variable",
  display: "swap",
});

const pageTitle = "PujaWay — Discover Kolkata's Durga Puja";
const pageDescription =
  "Find nearby pujas, explore Kolkata's most-loved pandals, and build your own Puja route with PujaWay.";

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

export default function Home() {
  return (
    <div className={`${bengaliSans.variable} ${bengaliSerif.variable}`}>
      <PujaWayHome />
    </div>
  );
}
