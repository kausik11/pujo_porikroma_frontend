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
import {
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { type PujaCardData } from "@/components/pujaway/PujaCard";
import { PujaWayBrand } from "@/components/pujaway/PujaWayBrand";
import { PujaWayHeader } from "@/components/pujaway/PujaWayHeader";
import type { Region } from "@/types/location";

type FeaturedRegion = Extract<Region, "SOUTH" | "NORTH" | "CENTRAL">;
type FeaturedCarouselCardData = {
  title: string;
  area: string;
  region: string;
  image: string;
  monochrome?: boolean;
};

const featuredRegions: FeaturedRegion[] = ["SOUTH", "NORTH", "CENTRAL"];
const featuredCarouselCards: FeaturedCarouselCardData[] = [
  {
    title: "Shyambazar Sorbojonin",
    area: "Shyambazar,",
    region: "South",
    image: "/images/pujaway/card-shyambazar.jpg",
    monochrome: true,
  },
  {
    title: "Santosh Mitra Square",
    area: "Central Kolkata,",
    region: "South",
    image: "/images/pujaway/card-santosh.jpg",
  },
  {
    title: "Ekdalia Evergreen",
    area: "Gariahat,",
    region: "South",
    image: "/images/pujaway/card-ekdalia.jpg",
    monochrome: true,
  },
  {
    title: "Triangular Park",
    area: "Ballygunge,",
    region: "South",
    image: "/images/pujaway/hero.jpg",
  },
] as const satisfies FeaturedCarouselCardData[];
const featuredCarouselLoop = [...featuredCarouselCards, ...featuredCarouselCards, ...featuredCarouselCards];
const styles = {
  page: "min-h-screen overflow-x-hidden bg-[#fff7e7] text-[#171612] font-(family-name:--font-geist-sans) [box-sizing:border-box] [&_a]:text-inherit [&_a]:no-underline",
  container: "mx-auto w-[min(calc(100%_-_48px),1230px)] max-[720px]:w-[min(calc(100%_-_36px),1230px)]",
  srOnly: "sr-only",
  flashScreen:
    "fixed inset-0 z-[2147483000] grid h-dvh w-screen place-items-center overflow-hidden bg-[#fff9ed] text-[#beb7a8] pointer-events-none animate-[flash-screen-exit_3.6s_cubic-bezier(0.5,0,0.2,1)_forwards]",
  flashKalka:
    "z-[0] object-cover object-center opacity-[0.26] mix-blend-multiply saturate-[0.92] sepia-[0.08] brightness-[1.01] contrast-[1.04] [inset:0!important] [height:100%!important] [width:100%!important]",
  flashBrand:
    "relative z-[2] w-[min(70vw,680px)] opacity-0 will-change-[transform,opacity] animate-[flash-brand-drop_4.2s_cubic-bezier(0.16,0.86,0.22,1)_forwards,flash-brand-fade_4.2s_ease-in-out_forwards] max-[720px]:w-[min(78vw,460px)]",
  flashLogo: "block h-auto w-full",
  hero:
    "relative z-[4] isolate grid h-[716px] place-items-center overflow-hidden text-[#fffaf1] shadow-[0_18px_22px_rgb(9_7_5_/_42%)] after:absolute after:inset-x-0 after:bottom-0 after:z-[-1] after:h-[118px] after:bg-[linear-gradient(180deg,transparent_0%,rgb(8_6_4_/_42%)_54%,rgb(5_4_3_/_82%)_100%)] after:content-[''] max-[980px]:h-[670px] max-[720px]:h-[675px] max-[720px]:place-items-end",
  heroVideo: "absolute inset-0 z-[-3] h-full w-full scale-[1.008] object-cover object-[57%_48%]",
  heroOverlay:
    "absolute inset-0 z-[-2] bg-[linear-gradient(90deg,rgb(0_0_0_/_60%),rgb(0_0_0_/_23%)_48%,rgb(0_0_0_/_46%)),linear-gradient(180deg,rgb(0_0_0_/_12%),rgb(0_0_0_/_43%))] max-[720px]:bg-[linear-gradient(180deg,rgb(0_0_0_/_18%),rgb(0_0_0_/_45%)_38%,rgb(0_0_0_/_79%))]",
  heroActions: "mt-[54px] flex justify-center gap-9 max-[720px]:mt-[34px] max-[720px]:flex-col max-[720px]:items-center max-[720px]:gap-[13px] [&_a]:inline-flex [&_a]:min-h-12 [&_a]:min-w-[283px] [&_a]:items-center [&_a]:justify-center [&_a]:rounded-full [&_a]:border [&_a]:border-white/55 [&_a]:bg-[#ffe49b] [&_a]:px-[26px] [&_a]:py-[9px] [&_a]:text-[18px] [&_a]:font-[550] [&_a]:leading-[1.2] [&_a]:!text-[#4b120f] [&_a]:shadow-[0_4px_24px_rgb(0_0_0_/_12%)] [&_a]:transition [&_a]:duration-150 hover:[&_a]:-translate-y-0.5 hover:[&_a]:bg-[#ffedb9] max-[720px]:[&_a]:w-[min(100%,340px)] max-[720px]:[&_a]:min-w-0 max-[720px]:[&_a]:text-[16px]",
  exploreSection:
    "relative z-[1] bg-[#fff7e7] py-[215px] pb-[180px] before:absolute before:inset-x-0 before:top-0 before:z-[3] before:h-[54px] before:bg-[linear-gradient(180deg,rgb(18_13_8_/_32%),rgb(18_13_8_/_12%)_42%,transparent)] before:opacity-80 before:content-[''] max-[720px]:py-[155px] max-[720px]:pb-[110px] [&>.container]:relative",
  heroBottomKalka:
    "pointer-events-none absolute left-1/2 top-[-350px] z-0 h-auto w-[min(58vw,640px)] -translate-x-1/2 opacity-[0.58] saturate-[0.95] sepia-[0.06] brightness-[1.03] contrast-[1.02] [mask-image:radial-gradient(circle,#000_0_58%,rgb(0_0_0_/_68%)_70%,transparent_84%)] max-[720px]:top-[-208px] max-[720px]:w-[min(92vw,360px)]",
  sectionHeadingRow:
    "mb-[70px] flex items-center justify-between gap-8 max-[720px]:mb-[42px] max-[720px]:flex-col max-[720px]:items-start [&_h2]:m-0 [&_h2]:max-w-[800px] [&_h2]:font-(family-name:--font-bengali-sans) [&_h2]:text-[clamp(36px,3.5vw,49px)] [&_h2]:font-[430] [&_h2]:leading-[1.25] [&_h2]:tracking-[-1.4px] max-[720px]:[&_h2]:text-[36px]",
  regionSelect:
    "relative flex-none after:pointer-events-none after:absolute after:right-[23px] after:top-1/2 after:size-2 after:-translate-y-[68%] after:rotate-45 after:border-b-[1.5px] after:border-r-[1.5px] after:border-white after:content-[''] [&_select]:h-[54px] [&_select]:w-[162px] [&_select]:appearance-none [&_select]:rounded-[10px] [&_select]:border-0 [&_select]:bg-[#171715] [&_select]:py-0 [&_select]:pl-[29px] [&_select]:pr-12 [&_select]:text-[21px] [&_select]:font-[450] [&_select]:leading-none [&_select]:text-white max-[720px]:[&_select]:h-[50px] max-[720px]:[&_select]:w-[150px] max-[720px]:[&_select]:text-[18px]",
  featuredCarousel:
    "relative left-1/2 ml-[-50vw] w-screen cursor-grab touch-pan-y select-none overflow-hidden py-[74px] [mask-image:linear-gradient(90deg,transparent_0,#000_9%,#000_91%,transparent_100%)] [scrollbar-width:none] active:cursor-grabbing max-[720px]:py-11 [&::-webkit-scrollbar]:hidden",
  featuredCarouselTrack:
    "flex w-max items-center gap-16 max-[720px]:gap-8",
  featuredCarouselCard:
    "group relative isolate mx-2 h-[370px] w-[438px] shrink-0 overflow-hidden rounded-[10px] bg-[#211b14] text-white shadow-[0_1px_0_rgb(0_0_0_/_18%)] transition-[transform,filter,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform max-[720px]:mx-1 max-[720px]:h-[325px] max-[720px]:w-[320px]",
  featuredCarouselCardLarge:
    "z-10 scale-[1.27] brightness-[1.03] shadow-[0_18px_38px_rgb(0_0_0_/_18%)] [&_h3]:text-[30px] [&_p]:text-[22px] max-[720px]:scale-[1.12] max-[720px]:[&_h3]:text-[23px] max-[720px]:[&_p]:text-[18px]",
  featuredCarouselImage: "pointer-events-none z-[-3] object-cover object-center transition-transform duration-500 group-hover:scale-[1.035]",
  featuredCarouselShade: "absolute inset-x-0 bottom-0 z-[-1] h-[132px] bg-[rgb(36_29_22_/_78%)] backdrop-blur-[1px] max-[720px]:h-[112px]",
  featuredCarouselBadge:
    "absolute left-8 top-6 z-[2] rounded-full bg-[#ffe7a6] px-5 py-2 text-[18px] leading-none text-[#1b1812] max-[720px]:left-5 max-[720px]:top-5 max-[720px]:text-[14px]",
  featuredCarouselCopy: "absolute inset-x-8 bottom-7 z-[2] max-[720px]:inset-x-5 max-[720px]:bottom-5",
  featuredCarouselTitle: "m-0 text-[26px] font-medium leading-[1.12] tracking-[0] transition-[font-size,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] max-[720px]:text-[22px]",
  featuredCarouselMeta: "mt-3 flex items-center gap-2.5 text-[18px] leading-none text-[#f4eee4] transition-[font-size,transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] max-[720px]:text-[17px]",
  pujaGrid: "grid grid-cols-3 gap-x-[38px] gap-y-[42px] max-[980px]:grid-cols-2 max-[720px]:grid-cols-1 max-[720px]:gap-6",
  pujaStatus:
    "col-span-full m-0 flex min-h-[120px] flex-col items-center justify-center gap-3.5 rounded-[11px] border border-[rgb(23_22_18_/_12%)] bg-white/35 p-8 text-center text-[18px] text-[#5b5548]",
  pujaRetry:
    "min-h-[42px] cursor-pointer rounded-full border border-[#171612] bg-[#171612] px-[18px] py-[9px] font-bold text-[#fff8e9] disabled:cursor-wait disabled:opacity-65 hover:not-disabled:bg-[#ffdb72] hover:not-disabled:text-[#171612] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-[#d54747]",
  promoBanner: "relative isolate h-[650px] overflow-hidden text-[#71120f] max-[720px]:h-[620px]",
  bannerImage: "z-[-3] translate-x-[18%] scale-[1.18] object-cover object-[center_48%] max-[720px]:translate-x-[20%] max-[720px]:scale-[1.2] max-[720px]:object-[69%_center]",
  bannerVeil:
    "absolute inset-0 z-[-2] bg-[linear-gradient(90deg,#fff4d6_0%,rgb(255_244_214_/_98%)_29%,rgb(255_244_214_/_85%)_48%,rgb(255_244_214_/_16%)_68%,transparent_78%),linear-gradient(180deg,rgb(142_43_17_/_5%),rgb(111_19_14_/_16%))] max-[980px]:bg-[linear-gradient(90deg,#fff4d6_0%,rgb(255_244_214_/_94%)_49%,rgb(255_244_214_/_32%)_76%,transparent)] max-[720px]:bg-[linear-gradient(180deg,#fff4d6_0%,rgb(255_244_214_/_92%)_45%,rgb(76_20_10_/_22%)_72%,rgb(33_11_7_/_52%))]",
  bannerCopy:
    "absolute left-[max(48px,calc((100vw_-_1230px)_/_2))] top-[39px] w-[515px] max-[720px]:left-[25px] max-[720px]:top-10 max-[720px]:w-[calc(100%_-_50px)]",
  bannerBrand: "absolute left-[455px] top-0 text-[#211c15] max-[980px]:left-80 max-[720px]:left-auto max-[720px]:right-0",
  bannerKicker: "mb-[-3px] ml-[95px] mt-[142px] text-[27px] font-semibold text-[#342018] max-[720px]:mb-0 max-[720px]:ml-[34px] max-[720px]:mt-[106px] max-[720px]:text-[21px]",
  bannerTitle: "m-0 font-(family-name:--font-bengali-serif) text-[100px] font-[650] leading-[0.9] tracking-[-6px] [text-shadow:0_2px_0_rgb(255_255_255_/_45%)] max-[720px]:text-[76px] max-[720px]:tracking-[-4px] max-[410px]:text-[67px]",
  bannerText: "mt-[43px] ml-[198px] max-w-[390px] text-[22px] font-[550] leading-[1.42] text-[#343129] max-[720px]:mt-7 max-[720px]:ml-[75px] max-[720px]:max-w-[270px] max-[720px]:text-[17px]",
  pujaStamp: "absolute bottom-[55px] left-[max(68px,calc((100vw_-_1230px)_/_2_+_18px))] grid size-[84px] rotate-[-8deg] place-items-center rounded-full border-[3px] border-double border-[#fff2d2] bg-[#9f1f16] text-[18px] font-semibold text-[#fff2d2] outline-[6px] outline-dotted outline-[#9f1f16] max-[720px]:bottom-[34px] max-[720px]:left-[34px] max-[720px]:size-[68px] max-[720px]:text-[15px]",
  liveSection: "bg-[#fff7e7] py-[177px] pb-[210px] max-[720px]:py-28 max-[720px]:pb-[132px]",
  liveNow: "mb-[22px] ml-1 flex items-center gap-[18px] text-[16px] font-[650] text-[#d51018] [&_span]:size-[18px] [&_span]:rounded-full [&_span]:bg-[#d51018] [&_span]:shadow-[0_0_0_7px_rgb(213_16_24_/_5%)]",
  liveLead: "mb-[79px] mt-9 text-[34px] font-[390] leading-[1.2] tracking-[-1.1px] max-[720px]:mb-[50px] max-[720px]:mt-[27px] max-[720px]:text-[25px] max-[720px]:leading-[1.35]",
  liveTitle: "m-0 text-[clamp(42px,4.1vw,58px)] font-[470] leading-[1.12] tracking-[-2.3px] max-[720px]:text-[43px]",
  liveGrid: "grid grid-cols-4 gap-14 max-[1120px]:gap-7 max-[980px]:grid-cols-2 max-[720px]:grid-cols-1 max-[720px]:gap-5",
  liveCard: "relative min-h-[421px] overflow-hidden rounded-lg bg-[#151514] p-[30px_25px] text-[#fffdf7] max-[720px]:min-h-[365px] [&_h3]:mt-[30px] [&_h3]:mb-0 [&_h3]:text-[23px] [&_h3]:font-[520] [&_h3]:leading-[1.15] [&_h3]:tracking-[-0.4px]",
  liveCardTop: "flex items-start justify-between text-[15px] text-[#f2eee5]",
  liveIcon: "grid size-[67px] place-items-center rounded-full bg-[#fff8e7] text-[#0d0d0c] [&_svg]:size-8 [&_svg]:stroke-[2.8px]",
  shortRule: "mt-[15px] block h-0.5 w-[39px] bg-[#f7f0df]",
  liveValue: "mt-7 mb-0 max-w-[205px] text-[34px] font-[430] leading-[1.16] tracking-[-1.2px]",
  liveSuffix: "mt-2 mb-0 text-[21px] font-[430]",
  busyBadge: "absolute bottom-[43px] left-[25px] inline-flex items-center gap-[9px] rounded-lg bg-[#fff7dc] px-3 py-[9px] text-[16px] font-semibold leading-none text-[#d31318] [&_span]:size-3 [&_span]:rounded-full [&_span]:bg-[#df1015]",
  sparkline: "absolute bottom-[38px] left-7 block h-[68px] w-28",
  sparklineLine: "absolute block h-0.5 origin-left rounded-full bg-[#fff8e7]",
  sparklineDot: "absolute right-[-4px] top-1 size-[7px] rounded-full bg-[#fff8e7]",
  introVideoSection: "bg-[#fff7e7] pb-[178px] max-[720px]:pb-[118px]",
  introVideoHeader: "mb-12 grid grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)] items-start gap-[52px] max-[980px]:grid-cols-1 max-[980px]:gap-6 max-[720px]:mb-8 max-[720px]:gap-2.5 [&_h2]:m-0 [&_h2]:max-w-[760px] [&_h2]:font-(family-name:--font-bengali-sans) [&_h2]:text-[clamp(36px,3.6vw,56px)] [&_h2]:font-[430] [&_h2]:leading-[1.2] [&_h2]:tracking-[-1.2px] max-[720px]:[&_h2]:text-[34px] max-[720px]:[&_h2]:leading-[1.28]",
  sectionLabel: "mb-[47px] mt-0 text-[28px] font-[560] max-[720px]:mb-[35px] max-[720px]:text-[24px]",
  introVideoFrame: "relative overflow-hidden rounded-[10px] border border-[rgb(23_22_18_/_16%)] bg-[#171612] shadow-[0_22px_70px_rgb(40_28_10_/_18%)] before:block before:pt-[56.25%] before:content-[''] max-[720px]:rounded-lg",
  introVideo: "absolute inset-0 h-full w-full object-cover",
  storySection: "bg-[#fff7e7] pt-[30px] pb-[218px] max-[720px]:pt-0 max-[720px]:pb-[125px]",
  storyGrid: "grid grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] items-start gap-[93px] max-[980px]:grid-cols-1 max-[980px]:gap-20 max-[720px]:gap-[62px]",
  storyCopy: "[&_h2]:m-0 [&_h2]:max-w-[570px] [&_h2]:text-[40px] [&_h2]:font-[390] [&_h2]:leading-[1.38] [&_h2]:tracking-[-1.35px] [&_h2_strong]:font-[610] [&_h2_strong]:text-[#d21419] [&>p:nth-of-type(2)]:mt-[45px] [&>p:nth-of-type(2)]:max-w-[480px] [&>p:nth-of-type(2)]:text-[27px] [&>p:nth-of-type(2)]:leading-[1.38] max-[980px]:[&_h2]:max-w-[720px] max-[980px]:[&>p:nth-of-type(2)]:max-w-[720px] max-[720px]:[&_h2]:text-[31px] max-[720px]:[&_h2]:leading-[1.44] max-[720px]:[&>p:nth-of-type(2)]:text-[23px]",
  storyFlow: "mt-[45px] flex w-fit flex-col items-center text-[16px] max-[720px]:items-start max-[720px]:text-[13px] [&_svg]:my-5 [&_svg]:size-[22px] [&_svg]:stroke-[1.8px] max-[720px]:[&_svg]:ml-[45%]",
  storyVisual: "relative isolate h-[607px] overflow-hidden rounded-[10px] bg-[#2d1c12] text-white max-[980px]:h-[640px] max-[720px]:h-[560px]",
  storyImage: "z-[-3] object-cover",
  storyVisualShade: "absolute inset-0 z-[-2] bg-[linear-gradient(180deg,rgb(10_9_7_/_19%),rgb(9_8_6_/_49%)),linear-gradient(90deg,rgb(0_0_0_/_36%),transparent_68%)]",
  storyVisualTop: "absolute left-[92px] right-12 top-[67px] flex items-start justify-between gap-6 max-[720px]:left-7 max-[720px]:right-7 max-[720px]:top-[38px] [&_h3]:m-0 [&_h3]:text-[53px] [&_h3]:font-semibold [&_h3]:leading-[1.13] [&_h3]:tracking-[-2px] max-[720px]:[&_h3]:text-[39px]",
  storyBrand: "max-[720px]:hidden [&>span:first-child]:text-[27px]",
  storyVisualMessage: "absolute left-[94px] right-[70px] top-[250px] border-t-[3px] border-white/90 pt-[23px] max-[720px]:left-[30px] max-[720px]:right-[30px] max-[720px]:top-[195px] [&_p]:m-0 [&_p]:max-w-[420px] [&_p]:text-[18px] [&_p]:leading-[1.42] [&_b]:mt-[43px] [&_b]:block [&_b]:text-[27px] [&_b]:leading-[1.25] max-[720px]:[&_b]:mt-[35px] max-[720px]:[&_b]:text-[23px]",
  poweredBy: "absolute bottom-[33px] right-[49px] m-0 text-right text-[14px] [&_strong]:mt-2 [&_strong]:block [&_strong]:text-[26px]",
  contactSection: "bg-[#fff7e7] pt-[158px] pb-[248px] max-[720px]:pt-[95px] max-[720px]:pb-[130px]",
  contactGrid: "grid grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] gap-[190px] max-[1120px]:gap-[100px] max-[980px]:grid-cols-1 max-[980px]:gap-20 max-[720px]:gap-[78px]",
  contactIntro: "[&_h2]:m-0 [&_h2]:max-w-[595px] [&_h2]:text-[39px] [&_h2]:font-[390] [&_h2]:leading-[1.44] [&_h2]:tracking-[-1.3px] [&>a]:mt-[39px] [&>a]:inline-block [&>a]:text-[21px] [&>a]:font-[650] hover:[&>a]:text-[#bf1217] focus-visible:[&>a]:text-[#bf1217] max-[980px]:[&_h2]:max-w-[760px] max-[720px]:[&_h2]:text-[31px] max-[720px]:[&_h2]:leading-[1.48] max-[720px]:[&>a]:mt-[30px] max-[720px]:[&>a]:text-[18px]",
  contactImageWrap: "relative mt-[43px] h-[284px] overflow-hidden bg-[#33241a] max-[980px]:h-[360px] max-[720px]:mt-[35px] max-[720px]:h-[260px]",
  contactImage: "object-cover object-[center_38%]",
  contactFormWrap: "pt-4 max-[980px]:max-w-[720px] [&_h3]:m-0 [&_h3]:text-[40px] [&_h3]:font-[590] [&_h3]:leading-[1.19] [&_h3]:tracking-[-1px] [&>p]:mt-[30px] [&>p]:mb-[41px] [&>p]:text-[21px] [&>p]:leading-[1.35] max-[720px]:[&_h3]:text-[36px] max-[720px]:[&>p]:text-[18px]",
  contactForm: "flex flex-col [&_label]:mb-[23px] [&_label]:flex [&_label]:flex-col [&_label]:gap-[9px] [&_label]:text-[20px] [&_input]:w-full [&_input]:rounded-none [&_input]:border-0 [&_input]:border-b-2 [&_input]:border-[#26231d] [&_input]:bg-transparent [&_input]:px-0 [&_input]:pb-[9px] [&_input]:pt-1.5 [&_input]:text-[18px] [&_input]:leading-[1.4] [&_input]:text-[#171612] [&_input]:outline-0 [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-none [&_textarea]:border-0 [&_textarea]:border-b-2 [&_textarea]:border-[#26231d] [&_textarea]:bg-transparent [&_textarea]:px-0 [&_textarea]:pb-[9px] [&_textarea]:pt-1.5 [&_textarea]:text-[18px] [&_textarea]:leading-[1.4] [&_textarea]:text-[#171612] [&_textarea]:outline-0 [&_input:focus]:border-[#c41318] [&_input:focus]:shadow-[0_2px_0_#c41318] [&_textarea:focus]:border-[#c41318] [&_textarea:focus]:shadow-[0_2px_0_#c41318] [&_button]:mt-2 [&_button]:min-h-[58px] [&_button]:w-full [&_button]:cursor-pointer [&_button]:rounded-[5px] [&_button]:border-0 [&_button]:bg-[#161615] [&_button]:text-[21px] [&_button]:font-medium [&_button]:leading-none [&_button]:text-white [&_button]:transition-colors hover:[&_button]:bg-[#9e1717] focus-visible:[&_button]:bg-[#9e1717]",
  formStatus: "mt-3.5 min-h-5 text-[13px] leading-[1.3] text-[#8a1919]",
} as const;
const heroContentClassName =
  "mt-[-150px] w-[min(calc(100%_-_48px),1360px)] text-center max-[720px]:m-0 max-[720px]:w-[min(calc(100%_-_36px),1230px)] max-[720px]:pb-[65px]";
const heroEyebrowClassName =
  "mb-[25px] mt-0 !font-['Li_Ador_Noirrit_VR',var(--font-bengali-sans),sans-serif] text-[30px] font-normal leading-none tracking-[0] max-[720px]:mb-[17px] max-[720px]:text-[19px]";
const heroTitleClassName =
  "mx-auto flex min-h-[130px] w-[min(100%,1180px)] max-w-[1180px] items-center justify-center text-balance !font-['Li_Alinur_Subas_Unicode',var(--font-bengali-serif),serif] text-[clamp(72px,6.95vw,100px)] font-normal leading-none tracking-[0] text-[#FFE7A2] max-[980px]:min-h-0 max-[980px]:w-full max-[980px]:text-[64px] max-[720px]:min-h-0 max-[720px]:w-full max-[720px]:text-[clamp(42px,12vw,64px)]";
const heroLeadClassName =
  "mx-auto mt-[55px] max-w-[1280px] text-balance text-center !font-['Li_Ador_Noirrit_VR',var(--font-bengali-sans),sans-serif] text-[35px] font-light leading-none tracking-[0] max-[980px]:max-w-[820px] max-[980px]:text-[27px] max-[720px]:mt-[31px] max-[720px]:max-w-full max-[720px]:text-[21px] max-[720px]:leading-[1.52]";

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
          <i className={`${styles.sparklineLine} bottom-2.5 left-0 w-[26px] rotate-[-10deg]`} />
          <i className={`${styles.sparklineLine} bottom-3.5 left-6 w-[30px] rotate-[-34deg]`} />
          <i className={`${styles.sparklineLine} bottom-[31px] left-12 w-9 rotate-[7deg]`} />
          <i className={`${styles.sparklineLine} bottom-[27px] left-[83px] w-[33px] rotate-[-51deg]`} />
          <b className={styles.sparklineDot} />
        </span>
      )}
    </article>
  );
}

function FeaturedCarouselCard({
  card,
  index,
  isActive,
  setCardRef,
}: {
  card: FeaturedCarouselCardData;
  index: number;
  isActive: boolean;
  setCardRef: (index: number, node: HTMLElement | null) => void;
}) {
  return (
    <article
      ref={(node) => setCardRef(index, node)}
      className={`${styles.featuredCarouselCard} ${isActive ? styles.featuredCarouselCardLarge : ""}`}
    >
      <Image
        src={card.image}
        alt=""
        fill
        sizes="(max-width: 720px) 320px, 438px"
        className={`${styles.featuredCarouselImage} ${card.monochrome ? "grayscale contrast-[1.04]" : ""}`}
      />
      <span className={styles.featuredCarouselBadge}>{card.region}</span>
      <span className={styles.featuredCarouselShade} aria-hidden="true" />
      <div className={styles.featuredCarouselCopy}>
        <h3 className={styles.featuredCarouselTitle}>{card.title}</h3>
        <p className={styles.featuredCarouselMeta}>
          <MapPin aria-hidden="true" className="size-6 flex-none fill-[#ff5a64] stroke-[#ff5a64] text-[#ff5a64] max-[720px]:size-5" />
          <span>{card.area}</span>
        </p>
      </div>
    </article>
  );
}

function FlashScreen() {
  return (
    <div className={styles.flashScreen} data-pujaway-flash-screen aria-hidden="true">
      <Image
        src="/images/Flash_screen_kalka.jpg"
        alt=""
        fill
        sizes="100vw"
        priority
        className={styles.flashKalka}
      />
      <div className={styles.flashBrand}>
        <Image
          src="/images/logo%20black%20pujaway.png"
          alt="PujaWay - Your Guide To Puja Hopping"
          width={1468}
          height={722}
          priority
          className={styles.flashLogo}
        />
      </div>
    </div>
  );
}

export function PujaWayHome({
  featuredLoadFailed = false,
}: PujaWayHomeProps) {
  const router = useRouter();
  const [region, setRegion] = useState<FeaturedRegion>("SOUTH");
  const [messageSent, setMessageSent] = useState(false);
  const [showFlashScreen, setShowFlashScreen] = useState(true);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(1);
  const [isCarouselDragging, setIsCarouselDragging] = useState(false);
  const carouselViewportRef = useRef<HTMLDivElement | null>(null);
  const carouselCardRefs = useRef<Array<HTMLElement | null>>([]);
  const carouselDragRef = useRef({
    isDragging: false,
    pointerId: 0,
    startScrollLeft: 0,
    startX: 0,
  });
  const [isRefreshingFeatured, startFeaturedRefresh] = useTransition();

  const normalizeCarouselScroll = useCallback(() => {
    const viewport = carouselViewportRef.current;

    if (!viewport) {
      return;
    }

    const loopWidth = viewport.scrollWidth / 3;

    if (loopWidth <= 0) {
      return;
    }

    if (viewport.scrollLeft >= loopWidth * 2) {
      viewport.scrollLeft -= loopWidth;
    } else if (viewport.scrollLeft < loopWidth) {
      viewport.scrollLeft += loopWidth;
    }
  }, []);

  useEffect(() => {
    let animationFrameId = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const viewport = carouselViewportRef.current;

    if (viewport) {
      viewport.scrollLeft = viewport.scrollWidth / 3;
    }

    function updateActiveCard() {
      const viewportCenter = window.innerWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      const viewport = carouselViewportRef.current;

      if (viewport && !prefersReducedMotion && !carouselDragRef.current.isDragging) {
        viewport.scrollLeft += 0.55;
        normalizeCarouselScroll();
      }

      carouselCardRefs.current.forEach((card, index) => {
        if (!card) {
          return;
        }

        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(cardCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveCarouselIndex((currentIndex) => (
        currentIndex === closestIndex ? currentIndex : closestIndex
      ));
      animationFrameId = window.requestAnimationFrame(updateActiveCard);
    }

    animationFrameId = window.requestAnimationFrame(updateActiveCard);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [normalizeCarouselScroll]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      setShowFlashScreen(false);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    }, 3600);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  function setCarouselCardRef(index: number, node: HTMLElement | null) {
    carouselCardRefs.current[index] = node;
  }

  function handleCarouselPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const viewport = carouselViewportRef.current;

    if (!viewport) {
      return;
    }

    carouselDragRef.current = {
      isDragging: true,
      pointerId: event.pointerId,
      startScrollLeft: viewport.scrollLeft,
      startX: event.clientX,
    };
    viewport.setPointerCapture(event.pointerId);
    setIsCarouselDragging(true);
  }

  function handleCarouselPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const dragState = carouselDragRef.current;
    const viewport = carouselViewportRef.current;

    if (!dragState.isDragging || !viewport) {
      return;
    }

    event.preventDefault();
    viewport.scrollLeft = dragState.startScrollLeft - (event.clientX - dragState.startX);
    normalizeCarouselScroll();
  }

  function endCarouselDrag() {
    const dragState = carouselDragRef.current;
    const viewport = carouselViewportRef.current;

    if (!dragState.isDragging) {
      return;
    }

    if (viewport?.hasPointerCapture(dragState.pointerId)) {
      viewport.releasePointerCapture(dragState.pointerId);
    }

    carouselDragRef.current = {
      isDragging: false,
      pointerId: 0,
      startScrollLeft: 0,
      startX: 0,
    };
    setIsCarouselDragging(false);
  }

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
      {showFlashScreen ? <FlashScreen /> : null}
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
          <div className={heroContentClassName}>
            <p className={heroEyebrowClassName} lang="bn">
              শারদীয়া ২০২৬
            </p>
            <h1 id="hero-title" className={heroTitleClassName} lang="bn">
              এই পুজোয়, হারিয়ে যাবেন না।
            </h1>
            <p className={heroLeadClassName} lang="bn">
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
          <Image
            src="/images/Flash_screen_kalka-transparent.png"
            alt=""
            width={1400}
            height={1400}
            aria-hidden="true"
            className={styles.heroBottomKalka}
          />
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
            </div>

            <div
              ref={carouselViewportRef}
              className={`${styles.featuredCarousel} ${isCarouselDragging ? "cursor-grabbing" : ""}`}
              aria-label="Featured Puja carousel"
              onPointerDown={handleCarouselPointerDown}
              onPointerMove={handleCarouselPointerMove}
              onPointerUp={endCarouselDrag}
              onPointerCancel={endCarouselDrag}
              onLostPointerCapture={endCarouselDrag}
            >
              <div className={styles.featuredCarouselTrack} data-featured-carousel-track>
                {featuredCarouselLoop.map((card, index) => (
                  <FeaturedCarouselCard
                    key={`${card.title}-${index}`}
                    card={card}
                    index={index}
                    isActive={activeCarouselIndex === index}
                    setCardRef={setCarouselCardRef}
                  />
                ))}
              </div>
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
          <PujaWayBrand className={styles.bannerBrand} />
            <p className={styles.bannerKicker} lang="bn">
              পুজো হোক
            </p>
            <h2 id="promo-title" className={styles.bannerTitle} lang="bn">
              নিজের
              <br />
              মতো
            </h2>
            <p className={styles.bannerText} lang="bn">উত্তর থেকে দক্ষিণ — প্রতিটি অঞ্চলে লুকিয়ে আছে এক একটি পুজোর গল্প</p>
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
            <h2 id="live-title" className={styles.liveTitle}>Around Kolkata</h2>
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
                autoPlay
                muted
                loop
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
                <PujaWayBrand inverse className={styles.storyBrand} />
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
