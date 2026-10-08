import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Footer, Header } from "./shared";
import { listPublishedProducts } from "./ventures/market-systems/market-data";
import { marketplaceProductUrl, MARKETPLACE_ORIGIN } from "./ventures/market-systems/market-links";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  // A page-level openGraph object replaces the layout's whole openGraph, so the image must be repeated here.
  openGraph: { type: "website", siteName: "GOLIDE", url: "/", title: "Digital Products, Software & Practical Tools | GOLIDE", description: "Digital products, practical tools, templates, software and research-driven technology built for real problems.", images: [{ url: "/og.webp", width: 1200, height: 630, alt: "GOLIDE digital products, software and technology" }] },
};

// Everything GOLIDE runs, with an honest status for each.
const doors = [
  { name: "Marketplace", text: "Digital products you can buy and use today: toolkits, templates and systems for your career, business and daily work.", status: "Open now", live: true, href: MARKETPLACE_ORIGIN + "/", external: true },
  { name: "Software", text: "SYLA, an AI workspace that turns raw files into charts, forecasts and decisions, and Market Systems, risk and execution tools for traders.", status: "In development", live: false, href: "/projects/syla", external: false },
  { name: "Studio", text: "Our content engine. It plans, records, edits and publishes video and posts across platforms from one place.", status: "Private for now", live: false, href: "https://studio.golidee.com/", external: true },
  { name: "Research", text: "Public-health dashboards, bioinformatics and data analysis, written up as case studies with the work behind them.", status: "Active", live: true, href: "/research", external: false },
  { name: "Work with us", text: "Need an automation, a dashboard or a custom tool? Tell us what you are trying to get done.", status: "Taking requests", live: true, href: "mailto:hello@golidee.com?subject=Working%20with%20GOLIDE", external: true },
];

const research = [
  { title: "Malaria facility intelligence", field: "Public health data", image: "/dhis2-card.webp", href: "/projects/malaria" },
  { title: "Tinospora phylogenetics", field: "Computational biology", image: "/tinospora.webp", href: "/projects/tinospora" },
  { title: "Child mortality patterns", field: "Global health", image: "/unicef.webp", href: "/projects/child-mortality" },
];

// The GOLIDE mark, drawn large: points of light gathered into a G, the last one gold.
const DOTS = Array.from({ length: 11 }, (_, i) => {
  const a = ((-40 + i * 29) * Math.PI) / 180;
  return { x: +(32 + 22 * Math.cos(a)).toFixed(2), y: +(32 + 22 * Math.sin(a)).toFixed(2), r: +(1.6 + i * 0.22).toFixed(2) };
});

function HeroMark() {
  return <svg className={styles.mark} viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g className={styles.markSpin}>
    {DOTS.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} style={{ animationDelay: `${i * 70}ms` }} />)}
    <circle cx={36} cy={32} r={2.2} className={styles.markInner} style={{ animationDelay: "820ms" }} />
    <circle cx={44} cy={32} r={3.6} className={styles.markGold} style={{ animationDelay: "960ms" }} />
  </g></svg>;
}

export default async function Home() {
  // Featured products first (set in Manage), then the newest. Up to three.
  const products = (await listPublishedProducts())
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt - a.createdAt)
    .slice(0, 3);

  return <main className={`neo-site ${styles.home}`}>
    <Header />

    <section className={`shell ${styles.hero}`}>
      <div className={styles.heroCopy}>
        <h1>Practical tools and AI software, built to move you forward.</h1>
        <p>GOLIDE brings together products you can use today, software in the making and the research behind it. Start with what you need.</p>
        <div className={styles.heroActions}>
          <a className={styles.primary} href={MARKETPLACE_ORIGIN + "/"}>Browse the marketplace <ArrowRight size={18} aria-hidden="true" /></a>
          <a className={styles.quiet} href="#everything">See everything we do</a>
        </div>
      </div>
      <HeroMark />
    </section>

    <section className={`shell ${styles.doorsSection}`} id="everything" aria-labelledby="everything-title">
      <h2 id="everything-title">Everything GOLIDE does, in one place.</h2>
      <ul className={styles.doors}>
        {doors.map((door) => {
          const inner = <>
            <span className={styles.doorName}>{door.name}</span>
            <span className={styles.doorText}>{door.text}</span>
            <span className={door.live ? styles.statusLive : styles.status}>{door.status}</span>
            <ArrowUpRight className={styles.doorArrow} size={22} aria-hidden="true" />
          </>;
          return <li key={door.name}>
            {door.external
              ? <a className={styles.door} href={door.href}>{inner}</a>
              : <Link className={styles.door} href={door.href}>{inner}</Link>}
          </li>;
        })}
      </ul>
    </section>

    {products.length > 0 && <section className={`shell ${styles.block}`} aria-labelledby="products-title">
      <div className={styles.blockHead}>
        <h2 id="products-title">Available in the marketplace</h2>
        <a className={styles.textLink} href={MARKETPLACE_ORIGIN + "/"}>All products <ArrowRight size={16} aria-hidden="true" /></a>
      </div>
      <div className={products.length === 1 ? styles.productSolo : styles.productGrid}>
        {products.map((product) => <a className={styles.product} href={marketplaceProductUrl(product.slug)} key={product.id}>
          <div className={styles.productImage}>
            {product.imageUrl ? <img src={product.imageUrl} alt="" loading="lazy" /> : null}
          </div>
          <div className={styles.productBody}>
            <span className={styles.productShelf}>{product.shelf}{product.format ? `, ${product.format.toLowerCase()}` : ""}</span>
            <h3>{product.name}</h3>
            <p>{product.summary}</p>
            <span className={styles.productCta}>{product.priceText ? `${product.priceText}. ` : ""}See the product <ArrowRight size={16} aria-hidden="true" /></span>
          </div>
        </a>)}
      </div>
    </section>}

    <section className={`shell ${styles.block}`} aria-labelledby="research-title">
      <div className={styles.blockHead}>
        <h2 id="research-title">From the research lab</h2>
        <Link className={styles.textLink} href="/research">All research <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
      <div className={styles.researchGrid}>
        {research.map((item) => <Link className={styles.research} href={item.href} key={item.href}>
          <div className={styles.researchImage}><img src={item.image + "?v=20260907"} alt="" loading="lazy" /></div>
          <span>{item.field}</span>
          <h3>{item.title}</h3>
        </Link>)}
      </div>
    </section>

    <section className={`shell ${styles.founder}`} aria-labelledby="founder-title">
      <img className={styles.founderPhoto} src="/founder/profile-suit-standing.webp?v=20260907-wide" alt="Esiah Kapinga, founder of GOLIDE" loading="lazy" />
      <div>
        <h2 id="founder-title">Built in Lusaka, Zambia.</h2>
        <p>GOLIDE was started by Esiah Kapinga, a microbiologist and software developer who connects science, data and software into tools people can actually use.</p>
        <Link className={styles.textLink} href="/founder">Read the founder story <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </section>

    <section className={`shell ${styles.contact}`}>
      <h2>Have something you want built?</h2>
      <a className={styles.primary} href="mailto:hello@golidee.com?subject=Hello%20GOLIDE">Email hello@golidee.com <ArrowRight size={18} aria-hidden="true" /></a>
    </section>

    <Footer />
  </main>;
}
