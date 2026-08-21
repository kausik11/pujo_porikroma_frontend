"use client";

import Link from "next/link";
import { ArrowRight, Menu, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/pujaway.module.css";
import { PujaWayBrand } from "@/components/pujaway/PujaWayBrand";

export const PUJAWAY_NAV_ITEMS = [
  { label: "Explore", href: "/#explore" },
  { label: "Puja Trails", href: "/route-planner" },
  { label: "Areas", href: "/locations" },
  { label: "Food", href: "/#live" },
  { label: "Our Story", href: "/#story" },
] as const;

export type PujaWayHeaderProps = {
  className?: string;
  skipToId?: string;
};

export function PujaWayHeader({ className, skipToId = "main-content" }: PujaWayHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <a className={styles.skipLink} href={`#${skipToId}`}>
        Skip to main content
      </a>
      <header className={`${styles.header} ${className ?? ""}`}>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/" aria-label="PujaWay home">
            <PujaWayBrand />
          </Link>

          <div className={styles.navLinks}>
            {PUJAWAY_NAV_ITEMS.map((item) => (
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
              aria-label="Search pujas or areas"
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
              {PUJAWAY_NAV_ITEMS.map((item) => (
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
    </>
  );
}
