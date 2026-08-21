import styles from "@/app/pujaway.module.css";

export type PujaWayBrandProps = {
  inverse?: boolean;
};

export function PujaWayBrand({ inverse = false }: PujaWayBrandProps) {
  return (
    <span className={`${styles.brand} ${inverse ? styles.brandInverse : ""}`}>
      <span className={styles.brandName}>PujaWay</span>
      <span className={styles.brandTagline}>Your Guide To Puja Hopping</span>
    </span>
  );
}
