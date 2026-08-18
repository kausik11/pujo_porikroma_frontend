"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Flame,
  MapPin,
  Menu,
  Search,
  SlidersHorizontal,
  Utensils,
  UsersRound,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import styles from "@/app/pujaway.module.css";

type Region = "South" | "North" | "Central";

type Puja = {
  id: string;
  name: string;
  location: string;
  region: Region;
  image: string;
  monochrome?: boolean;
};

const pujas: Puja[] = [
  {
    id: "south-ekdalia",
    name: "Ekdalia Evergreen",
    location: "Ballygunge",
    region: "South",
    image: "/images/pujaway/card-ekdalia.jpg",
    monochrome: true,
  },
  {
    id: "south-chetla",
    name: "Shyambazar Sorbojonin",
    location: "Shyambazar",
    region: "South",
    image: "/images/pujaway/card-shyambazar.jpg",
  },
  {
    id: "south-suruchi",
    name: "Santosh Mitra Square",
    location: "Shibpur, Bhawanipur",
    region: "South",
    image: "/images/pujaway/card-santosh.jpg",
    monochrome: true,
  },
  {
    id: "south-tridhara",
    name: "Ekdalia Evergreen",
    location: "Ballygunge",
    region: "South",
    image: "/images/pujaway/card-ekdalia.jpg",
    monochrome: true,
  },
  {
    id: "south-triangular",
    name: "Triangular Park",
    location: "Shibpur, Bhawanipur",
    region: "South",
    image: "/images/pujaway/card-shyambazar.jpg",
    monochrome: true,
  },
  {
    id: "south-mudiali",
    name: "Santosh Mitra Square",
    location: "Shibpur, Bhawanipur",
    region: "South",
    image: "/images/pujaway/card-santosh.jpg",
    monochrome: true,
  },
  {
    id: "north-shyambazar",
    name: "Shyambazar Sarbojanin",
    location: "Shyambazar",
    region: "North",
    image: "/images/pujaway/card-shyambazar.jpg",
  },
  {
    id: "north-kumartuli",
    name: "Kumartuli Park",
    location: "Kumartuli",
    region: "North",
    image: "/images/pujaway/card-ekdalia.jpg",
  },
  {
    id: "north-tala",
    name: "Tala Prattoy",
    location: "Belgachia",
    region: "North",
    image: "/images/pujaway/card-santosh.jpg",
  },
  {
    id: "north-ahiritola",
    name: "Ahiritola Sarbojanin",
    location: "Ahiritola",
    region: "North",
    image: "/images/pujaway/card-ekdalia.jpg",
    monochrome: true,
  },
  {
    id: "north-baghbazar",
    name: "Baghbazar Sarbojanin",
    location: "Baghbazar",
    region: "North",
    image: "/images/pujaway/card-shyambazar.jpg",
    monochrome: true,
  },
  {
    id: "north-hatibagan",
    name: "Hatibagan Sarbojanin",
    location: "Hatibagan",
    region: "North",
    image: "/images/pujaway/card-santosh.jpg",
    monochrome: true,
  },
  {
    id: "central-santosh",
    name: "Santosh Mitra Square",
    location: "Lebutala",
    region: "Central",
    image: "/images/pujaway/card-santosh.jpg",
  },
  {
    id: "central-college",
    name: "College Square",
    location: "College Street",
    region: "Central",
    image: "/images/pujaway/card-ekdalia.jpg",
  },
  {
    id: "central-mohammed",
    name: "Mohammed Ali Park",
    location: "Chittaranjan Avenue",
    region: "Central",
    image: "/images/pujaway/card-shyambazar.jpg",
  },
  {
    id: "central-sealdah",
    name: "Sealdah Athletic Club",
    location: "Sealdah",
    region: "Central",
    image: "/images/pujaway/card-santosh.jpg",
    monochrome: true,
  },
  {
    id: "central-subodh",
    name: "Subodh Mullick Square",
    location: "Wellington",
    region: "Central",
    image: "/images/pujaway/card-shyambazar.jpg",
    monochrome: true,
  },
  {
    id: "central-bowbazar",
    name: "Bowbazar Sarbojanin",
    location: "Bowbazar",
    region: "Central",
    image: "/images/pujaway/card-ekdalia.jpg",
    monochrome: true,
  },
];

const navItems = [
  { label: "Explore", href: "#explore" },
  { label: "Puja Trails", href: "/route-planner" },
  { label: "Areas", href: "/locations" },
  { label: "Food", href: "#live" },
  { label: "Our Story", href: "#story" },
];

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`${styles.brand} ${inverse ? styles.brandInverse : ""}`}>
      <span className={styles.brandName}>PujaWay</span>
      <span className={styles.brandTagline}>Your Guide To Puja Hopping</span>
    </span>
  );
}

function PujaCard({ puja }: { puja: Puja }) {
  return (
    <Link
      href={`/locations?search=${encodeURIComponent(puja.name)}`}
      className={styles.pujaCard}
      aria-label={`Explore ${puja.name} in ${puja.location}`}
    >
      <Image
        src={puja.image}
        alt={`${puja.name} Durga Puja pandal`}
        fill
        sizes="(max-width: 720px) 92vw, (max-width: 1100px) 45vw, 390px"
        className={`${styles.pujaImage} ${puja.monochrome ? styles.monochrome : ""}`}
      />
      <span className={styles.regionBadge}>{puja.region}</span>
      <div className={styles.cardShade} />
      <div className={styles.pujaCardCopy}>
        <h3>{puja.name}</h3>
        <p>
          <MapPin aria-hidden="true" />
          <span>{puja.location}</span>
        </p>
      </div>
    </Link>
  );
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
        <span>Live</span>
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

export function PujaWayHome() {
  const [region, setRegion] = useState<Region>("South");
  const [menuOpen, setMenuOpen] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const visiblePujas = pujas.filter((puja) => puja.region === region);

  useEffect(() => {
    if (!menuOpen) return;

    mobileMenuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    function closeMenu(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    function closeOnOutsidePress(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (mobileMenuRef.current?.contains(target) || menuButtonRef.current?.contains(target)) return;
      setMenuOpen(false);
    }

    document.addEventListener("keydown", closeMenu);
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => {
      document.removeEventListener("keydown", closeMenu);
      document.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [menuOpen]);

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
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/" aria-label="PujaWay home">
            <Brand />
          </Link>

          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>

          <form className={styles.searchBox} action="/locations" role="search">
            <SlidersHorizontal aria-hidden="true" />
            <input
              name="search"
              lang="bn"
              aria-label="Search pujas, areas or food"
              placeholder="পুজো, এলাকা বা ক্লাব খুঁজুন"
            />
            <button type="submit" aria-label="Search">
              <Search aria-hidden="true" />
            </button>
          </form>

          <button
            ref={menuButtonRef}
            className={styles.menuButton}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>

          {menuOpen ? (
            <div ref={mobileMenuRef} className={styles.mobileMenu} id="mobile-menu">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              ))}
              <form className={styles.mobileSearch} action="/locations" role="search">
                <input name="search" aria-label="Search PujaWay" placeholder="Search PujaWay" />
                <button type="submit" aria-label="Search">
                  <Search aria-hidden="true" />
                </button>
              </form>
            </div>
          ) : null}
        </nav>
      </header>

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
              <Link href="/multi-office-route" lang="bn">
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
                <select value={region} onChange={(event) => setRegion(event.target.value as Region)}>
                  <option value="South">South</option>
                  <option value="North">North</option>
                  <option value="Central">Central</option>
                </select>
              </label>
            </div>

            <div className={styles.pujaGrid} aria-live="polite">
              {visiblePujas.map((puja) => (
                <PujaCard key={puja.id} puja={puja} />
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
            <Brand />
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
              <span /> LIVE NOW
            </p>
            <h2 id="live-title">Live Around Kolkata</h2>
            <p className={styles.liveLead}>Real time updated from the city of joy</p>
            <div className={styles.liveGrid}>
              <LiveCard
                icon={UsersRound}
                title="Exploring Now"
                value="2,870"
                suffix="People"
                chart
              />
              <LiveCard
                icon={Flame}
                title="Trending Now"
                value="Santosh Mitra Square"
                busy
              />
              <LiveCard icon={MapPin} title="Most Active Area" value="North Kolkata" busy />
              <LiveCard
                icon={Utensils}
                title="Food Nearby"
                value="128"
                suffix="Restaurants"
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
                <Brand inverse />
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

      <footer className={styles.footer}>
        <div className={styles.footerPattern} aria-hidden="true" />
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div className={styles.footerBrandBlock}>
            <Brand inverse />
            <h2>Made for Kolkata. Built by CodeFair.</h2>
            <p>PujaWay<br />Your digital guide to Kolkata Puja</p>
            <p>A CodeFair Product<br />© 2026 CodeFair. All rights reserved.</p>
          </div>

          <nav className={styles.footerLinks} aria-label="Footer navigation">
            <h3>Services</h3>
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.footerTeam}>
            <h3>Core Team</h3>
            <a href="https://codefair.in" target="_blank" rel="noreferrer">
              Codefair.in
            </a>
            <span className={styles.footerSocial} aria-label="Facebook profile coming soon">
              <span>f</span> Facebook <ArrowRight aria-hidden="true" />
            </span>
            <span className={styles.footerSocial} aria-label="Instagram profile coming soon">
              <span>◎</span> Instagram <ArrowRight aria-hidden="true" />
            </span>
          </div>
        </div>
        <p className={styles.footerWatermark} aria-hidden="true">PujaWay</p>
      </footer>
    </div>
  );
}
