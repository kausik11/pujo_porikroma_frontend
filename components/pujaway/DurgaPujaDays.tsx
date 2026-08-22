"use client";

import SocialCards, { type CardItem } from "@/components/ui/card-fan-carousel";

const PUJA_DAY_CARDS: CardItem[] = [
  {
    imgUrl: "/images/pujaway/card-shyambazar.jpg",
    alt: "Durga idol lights for Shashthi Bodhon",
    title: "Shashthi Bodhon",
    subtitle: "Welcome Maa Durga with devotion and joy.",
    badge: "1",
  },
  {
    imgUrl: "/images/pujaway/card-santosh.jpg",
    alt: "Festive Durga Puja pandal scene for Saptami",
    title: "Saptami",
    subtitle: "Begin the sacred rituals and pandal visits.",
    badge: "2",
  },
  {
    imgUrl: "/images/pujaway/hero.jpg",
    alt: "Illuminated Puja pandal for Ashtami",
    title: "Ashtami Anjali",
    subtitle: "Offer prayers during the most awaited morning.",
    badge: "3",
  },
  {
    imgUrl: "/images/pujaway/card-ekdalia.jpg",
    alt: "Durga Puja artwork for Nabami",
    title: "Nabami",
    subtitle: "Celebrate the last full day of Puja rituals.",
    badge: "4",
  },
  {
    imgUrl: "/images/durga_ma.jpg",
    alt: "Close portrait of Maa Durga for Bijoya",
    title: "Bijoya",
    subtitle: "Carry the blessings home after visarjan.",
    badge: "5",
  },
];

export function DurgaPujaDays() {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#fff7e7] pt-24 pb-28 text-[#201d18] max-[720px]:pt-16 max-[720px]:pb-20"
      id="live"
      aria-labelledby="live-title"
    >
      <div className="pointer-events-none absolute left-1/2 top-[96px] z-[-1] size-[860px] -translate-x-1/2 bg-[url('/images/Flash_screen_kalka-transparent.png')] bg-contain bg-center bg-no-repeat opacity-[0.14] mix-blend-luminosity max-[720px]:top-[92px] max-[720px]:size-[520px]" />

      <div className="mx-auto w-[min(calc(100%_-_48px),1230px)] text-center max-[720px]:w-[min(calc(100%_-_36px),1230px)]">
        <h2 id="live-title" className="mx-auto max-w-[620px] text-balance text-[clamp(42px,4vw,58px)] font-[560] leading-[1.12] tracking-[0]">
          The Five Days Of
          <br />
          Durga Puja
        </h2>
        <p className="mx-auto mt-5 max-w-[540px] text-balance text-[25px] leading-[1.2] tracking-[0] text-[#201d18] max-[720px]:text-[20px]">
          Experience every sacred moment, from Bodhon to Bijoya
        </p>
      </div>

      <div className="mt-7 max-[720px]:mt-4">
        <SocialCards cards={PUJA_DAY_CARDS} />
      </div>
    </section>
  );
}
