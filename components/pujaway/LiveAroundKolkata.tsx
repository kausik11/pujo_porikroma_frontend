import { FaFireAlt, FaMapMarkerAlt, FaUtensils, FaUsers } from "react-icons/fa";
import type { IconType } from "react-icons";

type LiveMetricCard = {
  title: string;
  value: string;
  suffix?: string;
  badge?: string;
  icon: IconType;
  hasSparkline?: boolean;
};

const liveMetricCards: LiveMetricCard[] = [
  {
    title: "Exploring Now",
    value: "2,870",
    suffix: "Peoples",
    icon: FaUsers,
    hasSparkline: true,
  },
  {
    title: "Trending Now",
    value: "Santosh Mitra Square",
    badge: "Very Busy",
    icon: FaFireAlt,
  },
  {
    title: "Most Active Area",
    value: "North Kolkata",
    badge: "Very Busy",
    icon: FaMapMarkerAlt,
  },
  {
    title: "Food Nearby",
    value: "128",
    suffix: "Restaurants",
    icon: FaUtensils,
  },
];

function ActivitySparkline() {
  return (
    <svg
      className="mt-3 h-[44px] w-[86px] text-[#fff7e7]"
      viewBox="0 0 86 44"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 37C10 39 12 31 20 31C27 31 28 34 35 28C41 23 45 26 52 20C60 13 62 13 70 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="72" cy="6" r="2.8" fill="currentColor" />
    </svg>
  );
}

function LiveCard({ card }: { card: LiveMetricCard }) {
  const Icon = card.icon;

  return (
    <article className="relative flex min-h-[258px] flex-col rounded-[5px] bg-[linear-gradient(180deg,#a31a1a_0%,#760000_100%)] px-4 py-5 text-[#fff7e7] shadow-[0_18px_38px_rgb(100_15_10_/_14%)] max-[720px]:min-h-[230px]">
      <span className="absolute right-4 top-4 text-[13px] font-medium leading-none">Live</span>
      <div className="mb-[18px] grid size-[50px] place-items-center rounded-full bg-[#fff7e7] text-[23px] text-[#1f1914]">
        <Icon aria-hidden="true" />
      </div>

      <h3 className="text-[16px] font-semibold leading-[1.25] tracking-[0]">{card.title}</h3>
      <span className="mt-2 h-0.5 w-7 bg-[#fff7e7]" aria-hidden="true" />

      <p className="mt-[15px] whitespace-pre-line text-[26px] font-medium leading-[1.18] tracking-[0]">
        {card.value}
      </p>
      {card.suffix ? (
        <p className="mt-1 text-[16px] font-medium leading-[1.2]">{card.suffix}</p>
      ) : null}

      {card.badge ? (
        <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-[6px] bg-[#fff7e7] px-2.5 py-2 text-[13px] font-semibold leading-none text-[#d71919]">
          <span className="size-2 rounded-full bg-[#d71919]" aria-hidden="true" />
          {card.badge}
        </span>
      ) : null}

      {card.hasSparkline ? <ActivitySparkline /> : null}
    </article>
  );
}

export function LiveAroundKolkata() {
  return (
    <section
      className="relative overflow-hidden bg-[#fff7e7] py-[76px] text-[#1f1914] max-[720px]:py-14"
      aria-labelledby="live-around-kolkata-title"
    >
      <div className="mx-auto w-[min(calc(100%_-_48px),1230px)] max-[720px]:w-[min(calc(100%_-_36px),1230px)]">
        <p className="mb-4 flex items-center gap-3 text-[12px] font-medium uppercase leading-none text-[#d71919]">
          <span className="size-[11px] rounded-full bg-[#d71919]" aria-hidden="true" />
          Live Now
        </p>
        <h2
          id="live-around-kolkata-title"
          className="text-[32px] font-semibold leading-[1.15] tracking-[0] max-[720px]:text-[28px]"
        >
          Live Around Kolkata
        </h2>
        <p className="mt-5 text-[24px] leading-[1.25] tracking-[0] text-[#090807] max-[720px]:text-[18px]">
          Real time updated from the city of joy
        </p>

        <div className="mt-[34px] grid w-full grid-cols-4 gap-[38px] max-[980px]:grid-cols-2 max-[720px]:grid-cols-1 max-[720px]:gap-5">
          {liveMetricCards.map((card) => (
            <LiveCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
