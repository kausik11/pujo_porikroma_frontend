import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali, Noto_Serif_Bengali, Space_Grotesk } from "next/font/google";
import { PujaWayFooter } from "@/components/pujaway/PujaWayFooter";
import { QueryProvider } from "@/components/QueryProvider";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/virtual-tour-plugin/index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

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

export const metadata: Metadata = {
  title: "PujaWay — Discover Kolkata's Durga Puja",
  description:
    "Find nearby pujas, explore Kolkata's most-loved pandals, and build your own Puja route with PujaWay.",
  applicationName: "PujaWay",
  keywords: ["Durga Puja", "Kolkata pandals", "Puja hopping", "PujaWay"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${bengaliSans.variable} ${bengaliSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
        <PujaWayFooter />
      </body>
    </html>
  );
}
