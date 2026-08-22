import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { PUJAWAY_NAV_ITEMS } from "@/components/pujaway/navigation";
import { PujaWayBrand } from "@/components/pujaway/PujaWayBrand";

const footerLinkClassName =
  "text-[22px] font-[390] leading-none tracking-[-0.2px] text-[#f6f0e4] transition-colors hover:text-[#ffd773] focus-visible:text-[#ffd773] max-[720px]:text-[18px]";
const footerSocialClassName =
  "grid w-[174px] grid-cols-[26px_1fr_22px] items-center gap-3.5 border-b border-[#f6f0e4]/30 pb-[15px] text-[18px] font-[520] leading-none tracking-[-0.15px] text-[#f6f0e4] max-[720px]:w-[150px] max-[720px]:grid-cols-[22px_1fr_19px] max-[720px]:gap-3 max-[720px]:pb-3 max-[720px]:text-[15px]";

export function PujaWayFooter() {
  return (
    <footer className="relative min-h-[664px] overflow-hidden bg-[#111] text-[#f8f3e9] max-[720px]:min-h-[900px]">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgb(100_99_93_/_50%)_0%,rgb(51_51_48_/_52%)_23%,rgb(18_18_18_/_82%)_58%,#111_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-[-205px] size-[610px] -translate-x-1/2 bg-[url('/images/Flash_screen_kalka-transparent.png')] bg-contain bg-center bg-no-repeat opacity-[0.04] mix-blend-luminosity"
        aria-hidden="true"
      />
      <div className="relative z-[2] mx-auto grid w-[min(calc(100%_-_96px),1530px)] grid-cols-[minmax(0,1.55fr)_minmax(180px,0.36fr)_minmax(250px,0.56fr)] gap-[70px] pt-[94px] max-[1120px]:w-[min(calc(100%_-_64px),1230px)] max-[1120px]:grid-cols-[1.25fr_0.5fr_0.6fr] max-[1120px]:gap-[48px] max-[980px]:grid-cols-[1fr_1fr] max-[980px]:gap-y-[76px] max-[720px]:w-[min(calc(100%_-_36px),1230px)] max-[720px]:grid-cols-1 max-[720px]:gap-y-[58px] max-[720px]:pt-[70px]">
        <div className="max-[720px]:col-span-full">
          <PujaWayBrand
            inverse
            className="[&>span:first-child]:text-[48px] [&>span:first-child]:font-[390] [&>span:first-child]:tracking-[-2.4px] [&>span:last-child]:mt-2.5 [&>span:last-child]:text-[14px] [&>span:last-child]:font-[390] max-[720px]:[&>span:first-child]:text-[38px]"
          />
          <h2 className="mt-[48px] max-w-[460px] text-[32px] font-[560] leading-[1.28] tracking-[-0.55px] max-[720px]:mt-8 max-[720px]:text-[26px]">
            Made for Kolkata. Built by CodeFair.
          </h2>
          <p className="mt-[44px] text-[22px] font-[390] leading-[1.2] tracking-[-0.2px] max-[720px]:mt-7 max-[720px]:text-[18px]">
            PujaWay<br />Your digital guide to Kolkata Puja
          </p>
          <p className="mt-[46px] text-[22px] font-[390] leading-[1.2] tracking-[-0.2px] max-[720px]:mt-7 max-[720px]:text-[18px]">
            A CodeFair Product<br />© 2026 CodeFair. All rights reserved.
          </p>
        </div>

        <nav className="flex flex-col items-start gap-[28px] pt-0" aria-label="Footer navigation">
          <h3 className="mb-1 text-[22px] font-[650] leading-none tracking-[-0.25px]">Services</h3>
          {PUJAWAY_NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className={footerLinkClassName}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-start gap-[28px] pt-0">
          <h3 className="mb-1 text-[22px] font-[650] leading-none tracking-[-0.25px]">Core Team</h3>
          <a className={footerLinkClassName} href="https://codefair.in" target="_blank" rel="noreferrer">
            Codefair.in
          </a>
          <span className={footerSocialClassName} aria-label="Facebook profile coming soon">
            <FaFacebookF aria-hidden="true" className="size-[21px] justify-self-center max-[720px]:size-[18px]" />
            Facebook
            <ArrowRight aria-hidden="true" className="size-[21px]" />
          </span>
          <span className={footerSocialClassName} aria-label="Instagram profile coming soon">
            <FaInstagram aria-hidden="true" className="size-[21px] justify-self-center max-[720px]:size-[18px]" />
            Instagram
            <ArrowRight aria-hidden="true" className="size-[21px]" />
          </span>
        </div>
      </div>
      <p className="absolute bottom-[72px] left-1/2 z-[1] m-0 -translate-x-[28%] select-none text-[clamp(105px,9.6vw,170px)] font-[750] uppercase leading-none tracking-[-7px] text-white/[0.03] max-[980px]:bottom-8 max-[980px]:translate-x-[-50%] max-[720px]:bottom-6 max-[720px]:text-[68px] max-[720px]:tracking-[-4px]" aria-hidden="true">
        PUJAWAY
      </p>
    </footer>
  );
}
