import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUJAWAY_NAV_ITEMS } from "@/components/pujaway/navigation";
import { PujaWayBrand } from "@/components/pujaway/PujaWayBrand";

const footerLinkClassName = "text-[18px] text-[#e3ded4] hover:text-[#ffd773] focus-visible:text-[#ffd773]";
const footerSocialClassName =
  "grid w-40 grid-cols-[25px_1fr_18px] items-center gap-2.5 border-b border-white/25 pb-2.5 text-[18px] text-[#e3ded4]";

export function PujaWayFooter() {
  return (
    <footer className="relative min-h-[620px] overflow-hidden bg-[radial-gradient(circle_at_76%_2%,rgb(201_173_112_/_14%),transparent_36%),#171717] text-[#f8f3e9] max-[720px]:min-h-[900px]">
      <div
        className="absolute left-[210px] top-[-280px] size-[680px] rounded-full border-[44px] border-double border-[rgb(218_198_150_/_4%)] bg-[repeating-conic-gradient(from_0deg,transparent_0_11deg,rgb(218_198_150_/_4%)_12deg_13deg)]"
        aria-hidden="true"
      />
      <div className="relative z-[2] mx-auto grid w-[min(calc(100%_-_48px),1230px)] grid-cols-[1.75fr_0.42fr_0.76fr] gap-20 pt-[101px] max-[1120px]:gap-[55px] max-[980px]:grid-cols-[1.35fr_0.55fr_0.75fr] max-[980px]:gap-[38px] max-[720px]:grid-cols-2 max-[720px]:gap-y-[70px] max-[720px]:gap-x-[35px] max-[720px]:pt-[78px] max-[410px]:grid-cols-1">
        <div className="max-[720px]:col-span-full">
          <PujaWayBrand inverse />
          <h2 className="mt-12 max-w-[415px] text-[29px] font-[560] leading-[1.35] max-[720px]:mt-[35px]">Made for Kolkata. Built by CodeFair.</h2>
          <p className="mt-[52px] text-[17px] leading-normal max-[720px]:mt-[34px]">PujaWay<br />Your digital guide to Kolkata Puja</p>
          <p className="mt-10 text-[17px] leading-normal">A CodeFair Product<br />© 2026 CodeFair. All rights reserved.</p>
        </div>

        <nav className="flex flex-col items-start gap-[26px] pt-3 max-[410px]:pt-0" aria-label="Footer navigation">
          <h3 className="mb-[3px] text-[19px] font-semibold">Services</h3>
          {PUJAWAY_NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className={footerLinkClassName}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-start gap-[26px] pt-3 max-[410px]:pt-0">
          <h3 className="mb-[3px] text-[19px] font-semibold">Core Team</h3>
          <a className={footerLinkClassName} href="https://codefair.in" target="_blank" rel="noreferrer">
            Codefair.in
          </a>
          <span className={footerSocialClassName} aria-label="Facebook profile coming soon">
            <span className="text-center text-[25px] font-bold">f</span> Facebook <ArrowRight aria-hidden="true" className="size-[17px]" />
          </span>
          <span className={footerSocialClassName} aria-label="Instagram profile coming soon">
            <span className="text-center text-[25px] font-bold">◎</span> Instagram <ArrowRight aria-hidden="true" className="size-[17px]" />
          </span>
        </div>
      </div>
      <p className="absolute bottom-[-91px] right-[47px] z-[1] m-0 select-none text-[clamp(150px,17vw,245px)] font-[380] leading-none tracking-[-15px] text-white/5 max-[720px]:bottom-[-36px] max-[720px]:right-5 max-[720px]:text-[108px] max-[720px]:tracking-[-8px]" aria-hidden="true">PujaWay</p>
    </footer>
  );
}
