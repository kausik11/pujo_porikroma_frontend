export type PujaWayBrandProps = {
  className?: string;
  inverse?: boolean;
};

export function PujaWayBrand({ className, inverse = false }: PujaWayBrandProps) {
  return (
    <span className={`inline-flex flex-none flex-col leading-none ${inverse ? "text-[#fff8e8]" : "text-[#171612]"} ${className ?? ""}`}>
      <span className="text-[30px] font-[450] tracking-[-1.7px] max-[720px]:text-[27px]">PujaWay</span>
      <span className="mt-2 text-[8px] font-medium tracking-[-0.1px]">Your Guide To Puja Hopping</span>
    </span>
  );
}
