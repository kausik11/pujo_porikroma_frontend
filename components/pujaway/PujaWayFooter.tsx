import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "@/app/pujaway.module.css";
import { PUJAWAY_NAV_ITEMS } from "@/components/pujaway/navigation";
import { PujaWayBrand } from "@/components/pujaway/PujaWayBrand";

export function PujaWayFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerPattern} aria-hidden="true" />
      <div className={`${styles.container} ${styles.footerGrid}`}>
        <div className={styles.footerBrandBlock}>
          <PujaWayBrand inverse />
          <h2>Made for Kolkata. Built by CodeFair.</h2>
          <p>PujaWay<br />Your digital guide to Kolkata Puja</p>
          <p>A CodeFair Product<br />© 2026 CodeFair. All rights reserved.</p>
        </div>

        <nav className={styles.footerLinks} aria-label="Footer navigation">
          <h3>Services</h3>
          {PUJAWAY_NAV_ITEMS.map((item) => (
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
  );
}
