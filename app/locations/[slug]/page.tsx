import type { Metadata } from "next";
import { CalendarDays, Clock3, MapPin, Navigation, Sparkles, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";
import { DynamicPanorama } from "@/components/DynamicPanorama";
import { PujaActions } from "@/components/pujaway/PujaActions";
import { PujaCard, pujaCardDataFromLocation } from "@/components/pujaway/PujaCard";
import {
  PujaDirections,
  PujaRouteProvider,
  PujaTravelFacts,
} from "@/components/pujaway/PujaDirections";
import { PujaGallery } from "@/components/pujaway/PujaGallery";
import { PujaWayHeader } from "@/components/pujaway/PujaWayHeader";
import { virtualTourForLocation } from "@/data/dummyVirtualTours";
import { getPujaBySlug, getRelatedPujas } from "@/services/puja-data";
import type { Location } from "@/types/location";
import styles from "./puja-detail.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

function absoluteUrl(path: string) {
  try {
    return new URL(path, `${siteOrigin}/`).toString();
  } catch {
    return `${siteOrigin}${path.startsWith("/") ? path : `/${path}`}`;
  }
}

function humanize(value?: string) {
  if (!value) return undefined;
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatUpdatedAt(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return `Editorial update ${new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)}`;
}

function joinValues(values?: string[]) {
  const items = values?.map((value) => value.trim()).filter(Boolean) ?? [];
  return items.length ? items.join(", ") : undefined;
}

function detailsFor(puja: Location) {
  const theme = [puja.themeYear, puja.themeName].filter(Boolean).join(" — ");
  const contacts = [puja.phone, puja.alternatePhone].filter(Boolean).join(" / ");

  return [
    { label: "Theme", value: theme || undefined },
    { label: "Idol style", value: puja.idolStyle },
    { label: "Pandal theme", value: puja.pandalTheme },
    { label: "Established year", value: puja.establishedYear?.toString() },
    { label: "Puja type", value: puja.pujaType },
    { label: "Special attractions", value: joinValues(puja.specialAttractions) },
    { label: "Nearest metro", value: puja.nearestMetro },
    { label: "Accessibility", value: joinValues(puja.accessibility) },
    { label: "Opening hours", value: puja.openingHours },
    { label: "Contact", value: contacts || undefined },
    { label: "Email", value: puja.email },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const puja = await getPujaBySlug(slug);

  if (!puja || !puja.active) {
    return {
      title: "Puja not found",
      robots: { index: false, follow: false },
    };
  }

  const description = puja.shortDescription || puja.description;
  const canonicalUrl = absoluteUrl(`/locations/${puja.slug}`);
  const primaryImage = puja.photos.find((photo) => Boolean(photo.url));

  return {
    title: puja.title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${puja.title} | PujaWay`,
      description,
      url: canonicalUrl,
      siteName: "PujaWay",
      type: "website",
      locale: "bn_IN",
      images: primaryImage
        ? [{ url: absoluteUrl(primaryImage.url), alt: primaryImage.alt || `${puja.title} Durga Puja` }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${puja.title} | PujaWay`,
      description,
      images: primaryImage ? [absoluteUrl(primaryImage.url)] : undefined,
    },
  };
}

export default async function PujaDetailsPage({ params }: Props) {
  const { slug } = await params;
  const puja = await getPujaBySlug(slug);

  if (!puja || !puja.active) notFound();

  const relatedPujas = await getRelatedPujas(puja);
  const virtualTour = virtualTourForLocation(puja);
  const canonicalUrl = absoluteUrl(`/locations/${puja.slug}`);
  const [lng, lat] = puja.location.coordinates;
  const details = detailsFor(puja);
  const crowdLabel = humanize(puja.crowdLevel) || "Not available";
  const crowdNote = formatUpdatedAt(puja.crowdUpdatedAt);

  return (
    <div className={styles.page}>
      <PujaWayHeader />

      <main className={styles.main} id="main-content" tabIndex={-1}>
        <PujaRouteProvider destination={{ lat, lng }} destinationLabel={puja.title}>
          <section className={`${styles.container} ${styles.overview}`} aria-labelledby="puja-title">
            <PujaGallery title={puja.title} images={puja.photos} priority />

            <div className={styles.summary}>
              {puja.verified ? <span className={styles.verified}>Verified</span> : null}
              <h1 className={styles.title} id="puja-title">
                {puja.title}
              </h1>
              <p className={styles.address}>
                <MapPin aria-hidden="true" />
                <span>{puja.fullAddress}</span>
              </p>

              <div className={styles.facts} aria-label="Puja visit information">
                <PujaTravelFacts
                  className={styles.fact}
                  labelClassName={styles.factLabel}
                  valueClassName={styles.factValue}
                  noteClassName={styles.factNote}
                  iconClassName={styles.factIcon}
                />
                <div className={styles.fact}>
                  <UsersRound className={styles.factIcon} aria-hidden="true" />
                  <p className={styles.factLabel}>Crowd level</p>
                  <p className={`${styles.factValue} ${puja.crowdLevel ? styles.crowd : ""}`}>{crowdLabel}</p>
                  {crowdNote ? <p className={styles.factNote}>{crowdNote}</p> : null}
                </div>
                <div className={styles.fact}>
                  <Clock3 className={styles.factIcon} aria-hidden="true" />
                  <p className={styles.factLabel}>Best time</p>
                  <p className={styles.factValue}>{puja.bestVisitTime || "Not available"}</p>
                </div>
                <div className={styles.fact}>
                  <Sparkles className={styles.factIcon} aria-hidden="true" />
                  <p className={styles.factLabel}>Puja type</p>
                  <p className={styles.factValue}>{puja.pujaType || "Not available"}</p>
                </div>
                <div className={styles.fact}>
                  <CalendarDays className={styles.factIcon} aria-hidden="true" />
                  <p className={styles.factLabel}>Established</p>
                  <p className={styles.factValue}>{puja.establishedYear || "Not available"}</p>
                </div>
              </div>

              <a className={styles.directionsCta} href="#directions" lang="bn">
                <Navigation aria-hidden="true" /> এখানে যাও
              </a>
              <p className={styles.directionsHint}>Get directions to this Puja pandal</p>
            </div>
          </section>

          <section className={`${styles.container} ${styles.contentGrid}`} aria-label="Puja information and directions">
            <div className={styles.leftColumn}>
              <article className={`${styles.darkPanel} ${styles.about}`}>
                <h2 className={styles.panelTitle}>About This Puja</h2>
                <p className={styles.description}>{puja.description}</p>
                {details.length ? (
                  <dl className={styles.detailList}>
                    {details.map((detail) => (
                      <div className={styles.detailRow} key={detail.label}>
                        <dt>{detail.label}</dt>
                        <dd>{detail.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </article>

              {puja.visitTip ? (
                <aside className={`${styles.darkPanel} ${styles.tip}`}>
                  <strong>Tip:</strong> {puja.visitTip}
                </aside>
              ) : null}

              <PujaActions
                slug={puja.slug}
                title={puja.title}
                description={puja.shortDescription || puja.description}
                canonicalUrl={canonicalUrl}
                ratingAverage={puja.ratingAverage}
                ratingCount={puja.ratingCount}
              />
            </div>

            <section className={styles.directionsPanel} id="directions" aria-label="Location and directions">
              <PujaDirections heading="Location & Direction" mapAriaLabel={`Map and route to ${puja.title}`} />
            </section>
          </section>
        </PujaRouteProvider>

        <section className={`${styles.container} ${styles.related}`} aria-labelledby="related-pujas-title">
          <h2 className={styles.relatedTitle} id="related-pujas-title" lang="bn">
            প্রাসঙ্গিক পুজো
          </h2>
          {relatedPujas.length ? (
            <div className={styles.relatedGrid}>
              {relatedPujas.map((related) => (
                <PujaCard key={related._id} puja={pujaCardDataFromLocation(related)} headingLevel={3} />
              ))}
            </div>
          ) : (
            <p className={styles.relatedEmpty}>No nearby Puja records are available yet.</p>
          )}
        </section>

        {virtualTour?.nodes.length || puja.panorama360 ? (
          <section className={`${styles.container} ${styles.darkPanel} ${styles.immersive}`}>
            <h2 className={styles.panelTitle}>Explore in 360°</h2>
            <p className={styles.immersiveLead}>Step inside the Puja route and move between available panorama viewpoints.</p>
            <DynamicPanorama src={puja.panorama360?.url} tour={virtualTour} />
          </section>
        ) : null}
      </main>
    </div>
  );
}
