"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  Flame,
  MapPin,
  Utensils,
  UsersRound,
} from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import styles from "@/app/pujaway.module.css";
import { PujaCard, type PujaCardData } from "@/components/pujaway/PujaCard";
import { PujaWayBrand } from "@/components/pujaway/PujaWayBrand";
import { PujaWayHeader } from "@/components/pujaway/PujaWayHeader";
import type { Region } from "@/types/location";

type FeaturedRegion = Extract<Region, "SOUTH" | "NORTH" | "CENTRAL">;

const featuredRegions: FeaturedRegion[] = ["SOUTH", "NORTH", "CENTRAL"];

export type PujaWayHomeProps = {
  featuredPujas: PujaCardData[];
  featuredLoadFailed?: boolean;
};

function formatRegion(region: FeaturedRegion) {
  return region.charAt(0) + region.slice(1).toLowerCase();
}

function LiveCard({
  icon: Icon,
  title,
  value,
  suffix,
  busy,
  chart,
}: {
  icon: typeof UsersRound;
  title: string;
  value: string;
  suffix?: string;
  busy?: boolean;
  chart?: boolean;
}) {
  return (
    <article className={styles.liveCard}>
      <div className={styles.liveCardTop}>
        <span className={styles.liveIcon}>
          <Icon aria-hidden="true" />
        </span>
        <span>Guide</span>
      </div>
      <h3>{title}</h3>
      <span className={styles.shortRule} />
      <p className={styles.liveValue}>{value}</p>
      {suffix && <p className={styles.liveSuffix}>{suffix}</p>}
      {busy && (
        <span className={styles.busyBadge}>
          <span /> Very Busy
        </span>
      )}
      {chart && (
        <span className={styles.sparkline} role="img" aria-label="Activity is rising">
          <i />
          <i />
          <i />
          <i />
          <b />
        </span>
      )}
    </article>
  );
}

export function PujaWayHome({
  featuredPujas,
  featuredLoadFailed = false,
}: PujaWayHomeProps) {
  const router = useRouter();
  const [region, setRegion] = useState<FeaturedRegion>("SOUTH");
  const [messageSent, setMessageSent] = useState(false);
  const [isRefreshingFeatured, startFeaturedRefresh] = useTransition();
  const visiblePujas = featuredPujas.filter((puja) => puja.region === region);

  function retryFeaturedPujas() {
    startFeaturedRefresh(() => router.refresh());
  }

  function handleMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const message = String(formData.get("message") ?? "");
    const subject = encodeURIComponent(`PujaWay enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:infocodefair@gmail.com?subject=${subject}&body=${body}`;
    setMessageSent(true);
  }

  return (
    <div className={styles.page}>
      <PujaWayHeader />

      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <video
            className={styles.heroVideo}
            poster="/images/pujaway/banner-durga.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src="/video/pujo%20way%20hero%20vd.mp4" type="video/mp4" />
          </video>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow} lang="bn">
              শারদীয়া ২০২৬
            </p>
            <h1 id="hero-title" lang="bn">
              এই পুজোয়, হারিয়ে যাবেন না।
            </h1>
            <p className={styles.heroLead} lang="bn">
              আপনার কাছাকাছি কোন পুজো? এক নজরে দেখুন, পথ খুঁজুন, আর নিজের পুজো
              পরিক্রমা তৈরি করুন।
            </p>
            <div className={styles.heroActions}>
              <Link href="/locations/near-me" lang="bn">
                আমার কাছাকাছি পুজো দেখুন
              </Link>
              <Link href="/route-planner" lang="bn">
                আমার প্ল্যান তৈরি করুন
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.exploreSection} id="explore" aria-labelledby="explore-title">
          <div className={styles.mandala} aria-hidden="true" />
          <div className={styles.container}>
            <div className={styles.sectionHeadingRow}>
              <h2 id="explore-title" lang="bn">
                নির্বাচিত, জনপ্রিয় ও প্রস্তাবিত পুজো
              </h2>
              <label className={styles.regionSelect}>
                <span className={styles.srOnly}>Choose a Kolkata region</span>
                <select
                  value={region}
                  onChange={(event) => setRegion(event.target.value as FeaturedRegion)}
                >
                  {featuredRegions.map((item) => (
                    <option key={item} value={item}>
                      {formatRegion(item)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.pujaGrid} aria-live="polite" aria-busy={isRefreshingFeatured}>
              {featuredLoadFailed ? (
                <div className={styles.pujaStatus} role="alert">
                  <p>We couldn&apos;t load featured pujas from the Puja service.</p>
                  <button
                    className={styles.pujaRetry}
                    type="button"
                    onClick={retryFeaturedPujas}
                    disabled={isRefreshingFeatured}
                  >
                    {isRefreshingFeatured ? "Trying again…" : "Try again"}
                  </button>
                </div>
              ) : null}
              {!featuredLoadFailed && visiblePujas.length === 0 ? (
                <p className={styles.pujaStatus}>
                  No active featured pujas have been published for this region yet.
                </p>
              ) : null}
              {visiblePujas.map((puja) => (
                <PujaCard key={puja.slug} puja={puja} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.promoBanner} aria-labelledby="promo-title">
          <Image
            src="/images/pujaway/hero.jpg"
            alt="Close portrait of Maa Durga"
            fill
            sizes="100vw"
            className={styles.bannerImage}
          />
          <div className={styles.bannerVeil} />
          <div className={styles.bannerCopy}>
            <PujaWayBrand />
            <p className={styles.bannerKicker} lang="bn">
              পুজো হোক
            </p>
            <h2 id="promo-title" lang="bn">
              নিজের
              <br />
              মতো
            </h2>
            <p lang="bn">উত্তর থেকে দক্ষিণ — প্রতিটি অঞ্চলে লুকিয়ে আছে এক একটি পুজোর গল্প</p>
          </div>
          <span className={styles.pujaStamp} lang="bn" aria-hidden="true">
            পুজো
          </span>
        </section>

        <section className={styles.liveSection} id="live" aria-labelledby="live-title">
          <div className={styles.container}>
            <p className={styles.liveNow}>
              <span /> EDITORIAL GUIDE
            </p>
            <h2 id="live-title">Around Kolkata</h2>
            <p className={styles.liveLead}>Curated planning highlights; local conditions can change.</p>
            <div className={styles.liveGrid}>
              <LiveCard
                icon={UsersRound}
                title="Plan Your Visit"
                value="Explore"
                suffix="Pujas by area"
              />
              <LiveCard
                icon={Flame}
                title="Featured Puja"
                value="Santosh Mitra Square"
              />
              <LiveCard icon={MapPin} title="Featured Area" value="North Kolkata" />
              <LiveCard
                icon={Utensils}
                title="Food Nearby"
                value="Browse"
                suffix="Food stops"
              />
            </div>
          </div>
        </section>

        <section className={styles.introVideoSection} aria-labelledby="intro-video-title">
          <div className={styles.container}>
            <div className={styles.introVideoHeader}>
              <p className={styles.sectionLabel}>PujaWay Preview</p>
              <h2 id="intro-video-title" lang="bn">
                পুজো পরিক্রমা শুরু করার আগে এক ঝলক দেখে নিন
              </h2>
            </div>
            <div className={styles.introVideoFrame}>
              <video
                className={styles.introVideo}
                controls
                muted
                playsInline
                preload="metadata"
                poster="/images/pujaway/banner-durga.jpg"
              >
                <source src="/video/pujo%20way%20intro%20vd.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        <section className={styles.storySection} id="story" aria-labelledby="story-title">
          <div className={`${styles.container} ${styles.storyGrid}`}>
            <div className={styles.storyCopy}>
              <p className={styles.sectionLabel}>Our Story</p>
              <h2 id="story-title">
                <strong>PujaWay</strong> is a digital experience <strong>created by CodeFair</strong> to
                help people discover, navigate and experience Kolkata&apos;s Puja in a smarter way.
              </h2>
              <p>Technology meets the spirit of Kolkata.</p>
              <div className={styles.storyFlow}>
                <b>CODEFAIR - Technology . Design . AI</b>
                <ArrowDown aria-hidden="true" />
                <b>PUJAWAY - Discover . Navigate . Explore</b>
              </div>
            </div>

            <article className={styles.storyVisual}>
              <Image
                src="/images/pujaway/story.jpg"
                alt="A Durga Puja celebration reflected on water at night"
                fill
                sizes="(max-width: 900px) 92vw, 560px"
                className={styles.storyImage}
              />
              <div className={styles.storyVisualShade} />
              <div className={styles.storyVisualTop}>
                <h3>Subha<br />Durga Pujo</h3>
                <PujaWayBrand inverse />
              </div>
              <div className={styles.storyVisualMessage}>
                <p>May Ma Durga bless you and your family with happiness, peace and prosperity.</p>
                <b>PujaWay From<br />CodeFair</b>
              </div>
              <p className={styles.poweredBy}>Powered By <strong>CodeFair</strong></p>
            </article>
          </div>
        </section>

        <section className={styles.contactSection} aria-labelledby="contact-title">
          <div className={`${styles.container} ${styles.contactGrid}`}>
            <div className={styles.contactIntro}>
              <h2 id="contact-title">
                We&apos;d love to hear from you — whether you have a project in mind, or just want to say
                hi.
              </h2>
              <a href="mailto:infocodefair@gmail.com">infocodefair@gmail.com</a>
              <div className={styles.contactImageWrap}>
                <Image
                  src="/images/pujaway/contact.jpg"
                  alt="A visitor using PujaWay during Durga Puja"
                  fill
                  sizes="(max-width: 900px) 92vw, 560px"
                  className={styles.contactImage}
                />
              </div>
            </div>

            <div className={styles.contactFormWrap}>
              <h3>Join our<br />newsletter</h3>
              <p>Daily dose of design trends by the team.</p>
              <form onSubmit={handleMessage} className={styles.contactForm}>
                <label>
                  <span>Name</span>
                  <input name="name" autoComplete="name" required />
                </label>
                <label>
                  <span>Email</span>
                  <input name="email" type="email" autoComplete="email" required />
                </label>
                <label>
                  <span>Message</span>
                  <textarea name="message" rows={2} required />
                </label>
                <button type="submit">SEND</button>
                <p className={styles.formStatus} aria-live="polite">
                  {messageSent ? "Your email app should open so you can review and send the message." : ""}
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
