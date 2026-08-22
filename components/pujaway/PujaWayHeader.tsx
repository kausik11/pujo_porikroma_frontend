"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PUJAWAY_NAV_ITEMS } from "@/components/pujaway/navigation";

export type PujaWayHeaderProps = {
  className?: string;
  skipToId?: string;
};

const navLinkClassName =
  "group inline-flex items-center gap-2 py-3.5 font-(family-name:--font-space-grotesk) text-[20px] font-normal leading-none text-center tracking-[0]";
const navLinkLabelClassName =
  "relative after:absolute after:inset-x-0 after:bottom-[-7px] after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-200 group-hover:after:origin-left group-hover:after:scale-x-100 group-focus-visible:after:origin-left group-focus-visible:after:scale-x-100";
const activeNavLinkClassName = "after:origin-left after:scale-x-100";
const searchFormClassName =
  "ml-auto grid h-11 w-[313px] grid-cols-[20px_minmax(0,1fr)_34px] items-center overflow-hidden rounded-[9px] bg-linear-to-b from-[#8B1E1E] to-[#500000] pl-[15px] text-[#FFE9AD]";
const searchInputClassName =
  "w-full min-w-0 bg-transparent px-[9px] text-center font-['Li_Ador_Noirrit_VR',var(--font-bengali-sans),sans-serif] text-[14px] font-light leading-none tracking-[0] text-[#FFE9AD] outline-none placeholder:text-[#FFE9AD] placeholder:opacity-100";
const searchButtonClassName =
  "grid size-[34px] cursor-pointer place-items-center border-0 bg-transparent p-0 text-[#FFE9AD]";
const mobileMenuLinkClassName =
  "flex items-center justify-between border-b border-[rgb(23_22_18_/_10%)] px-0.5 py-3.5 font-(family-name:--font-space-grotesk) text-center text-[20px] font-normal leading-none tracking-[0]";
const skipLinkClassName =
  "fixed left-3 top-3 z-[100] rounded-[7px] bg-[#171612] px-[15px] py-2.5 text-white! transition-transform duration-150 -translate-y-[180%] focus:translate-y-0";
const headerClassName =
  "sticky top-0 z-50 border-b border-[rgb(23_22_18_/_10%)] bg-[#fff4d9] shadow-[0_8px_28px_rgb(23_22_18_/_7%)]";
const navClassName =
  "relative mx-auto flex min-h-[116px] w-[min(calc(100%_-_48px),1230px)] items-center max-[980px]:min-h-[88px] max-[720px]:w-[min(calc(100%_-_36px),1230px)]";
const navLinksClassName =
  "ml-[clamp(44px,5.7vw,78px)] flex items-center gap-[clamp(24px,3.1vw,49px)] whitespace-nowrap max-[1120px]:ml-[42px] max-[1120px]:gap-6 max-[980px]:hidden";
const menuButtonClassName =
  "ml-auto hidden size-11 cursor-pointer place-items-center rounded-full border border-[rgb(23_22_18_/_18%)] bg-transparent p-0 text-[#171612] max-[980px]:grid [&_svg]:size-[21px]";
const mobileMenuClassName =
  "absolute right-0 top-[76px] flex w-[min(390px,100%)] flex-col rounded-[14px] border border-[rgb(23_22_18_/_9%)] bg-[#fff4d9] p-6 shadow-[0_22px_50px_rgb(42_30_12_/_16%)] max-[410px]:right-[-9px] max-[410px]:w-[calc(100%_+_18px)]";

function subscribeToHashChange(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function getHashSnapshot() {
  return window.location.hash || "#explore";
}

function getServerHashSnapshot() {
  return "#explore";
}

export function PujaWayHeader({ className, skipToId = "main-content" }: PujaWayHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeHash = useSyncExternalStore(subscribeToHashChange, getHashSnapshot, getServerHashSnapshot);
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

  function isActive(href: string) {
    const [itemPath, itemHash] = href.split("#");
    if (itemHash) return pathname === (itemPath || "/") && activeHash === `#${itemHash}`;
    return pathname === href;
  }

  return (
    <>
      <a className={skipLinkClassName} href={`#${skipToId}`}>
        Skip to main content
      </a>
      <header className={`${headerClassName} ${className ?? ""}`}>
        <nav className={navClassName} aria-label="Main navigation">
          <Link href="/" aria-label="PujaWay home" className="inline-flex w-[104px] flex-none items-center max-[720px]:w-24">
            <Image
              src="/images/logo%20black%20pujaway.png"
              alt="PujaWay - Your Guide To Puja Hopping"
              width={1468}
              height={722}
              priority
              className="block h-auto w-full"
            />
          </Link>

          <div className={navLinksClassName}>
            {PUJAWAY_NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={navLinkClassName}
                  aria-current={active ? (item.href.includes("#") ? "location" : "page") : undefined}
                >
                  <span className={`${navLinkLabelClassName} ${active ? activeNavLinkClassName : ""}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <form className={searchFormClassName} action="/locations" role="search">
            <SlidersHorizontal aria-hidden="true" className="size-[15px]" />
            <input
              className={searchInputClassName}
              name="search"
              lang="bn"
              aria-label="Search pujas or areas"
              placeholder="পুজো, এলাকা বা ক্লাব খুঁজুন"
            />
            <button className={searchButtonClassName} type="submit" aria-label="Search">
              <Search aria-hidden="true" className="size-[18px]" />
            </button>
          </form>

          <button
            ref={menuButtonRef}
            className={menuButtonClassName}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>

          {menuOpen ? (
            <div ref={mobileMenuRef} className={mobileMenuClassName} id="mobile-menu">
              {PUJAWAY_NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={mobileMenuLinkClassName}
                    aria-current={active ? (item.href.includes("#") ? "location" : "page") : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                    <ArrowRight aria-hidden="true" className="size-[18px]" />
                  </Link>
                );
              })}
              <form
                className="mt-[18px] grid h-[46px] grid-cols-[1fr_38px] items-center overflow-hidden rounded-lg bg-linear-to-b from-[#8B1E1E] to-[#500000] pl-2 text-[#FFE9AD]"
                action="/locations"
                role="search"
              >
                <input className={searchInputClassName} name="search" aria-label="Search PujaWay" placeholder="Search PujaWay" />
                <button className={searchButtonClassName} type="submit" aria-label="Search">
                  <Search aria-hidden="true" className="size-[18px]" />
                </button>
              </form>
            </div>
          ) : null}
        </nav>
      </header>
    </>
  );
}
