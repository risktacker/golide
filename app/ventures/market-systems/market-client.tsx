"use client";

import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Layers3, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { MarketProduct } from "./market-data";
import styles from "./market.module.css";

type Props = {
  products: MarketProduct[];
  canManage: boolean;
};

const shelves = [
  { name: "Career", label: "CAREER SYSTEMS" },
  { name: "Creator", label: "CREATOR TOOLS" },
  { name: "Business", label: "BUSINESS SYSTEMS" },
  { name: "Productivity", label: "PRODUCTIVITY" },
  { name: "Learning", label: "LEARNING" },
];

function ProductObject({ product, onOpen }: { product: MarketProduct; onOpen: () => void }) {
  const format = product.format.toLowerCase();
  const shapeClass = format.includes("tool") || format.includes("template")
    ? styles.toolkit
    : format.includes("course") || format.includes("video")
      ? styles.screen
      : styles.book;

  return (
    <button className={`${styles.productObject} ${shapeClass}`} onClick={onOpen} aria-label={`Open ${product.name}`}>
      {product.imageUrl ? (
        <img src={product.imageUrl} alt="" />
      ) : (
        <span className={styles.generatedCover}>
          <small>{product.format}</small>
          <strong>{product.name}</strong>
          <em>G$LIDE</em>
        </span>
      )}
      {product.featured && <span className={styles.featuredTag}>FEATURED</span>}
    </button>
  );
}

export default function MarketClient({ products, canManage }: Props) {
  const [selected, setSelected] = useState<MarketProduct | null>(null);
  const [activeShelf, setActiveShelf] = useState("All");

  const visibleShelves = useMemo(() => {
    if (activeShelf === "All") return shelves;
    return shelves.filter((shelf) => shelf.name === activeShelf);
  }, [activeShelf]);

  return (
    <>
      <section className={styles.marketHero}>
        <div>
          <p className={styles.eyebrow}><Sparkles size={14}/> G$LIDE DIGITAL MARKET</p>
          <h1>Useful systems.<br/><span>Built for real problems.</span></h1>
          <p className={styles.intro}>A curated shelf of digital toolkits, playbooks and learning systems. Browse here. Checkout and delivery are handled securely through Whop.</p>
        </div>
        <div className={styles.heroMeta}>
          <span><Layers3 size={16}/>{products.length || "00"} live products</span>
          <span><BriefcaseBusiness size={16}/> Global digital delivery</span>
          {canManage && <Link className={styles.manageButton} href="/ventures/market-systems/manage">+ Add product</Link>}
        </div>
      </section>

      <nav className={styles.filters} aria-label="Marketplace shelves">
        {["All", ...shelves.map((s) => s.name)].map((name) => (
          <button key={name} className={activeShelf === name ? styles.activeFilter : ""} onClick={() => setActiveShelf(name)}>{name}</button>
        ))}
      </nav>

      <section className={styles.storeRoom} aria-label="GOLIDE digital product shelves">
        <div className={styles.storeGlow}/>
        {visibleShelves.map((shelf) => {
          const items = products.filter((product) => product.shelf === shelf.name);
          return (
            <div className={styles.shelfZone} key={shelf.name}>
              <div className={styles.shelfHeading}>
                <span>{shelf.label}</span>
                <small>{items.length ? `${String(items.length).padStart(2, "0")} ITEMS` : "READY FOR RELEASE"}</small>
              </div>
              <div className={styles.shelfStage}>
                <div className={styles.shelfProducts}>
                  {items.map((product) => <ProductObject key={product.id} product={product} onOpen={() => setSelected(product)}/>) }
                  {!items.length && (
                    <div className={styles.emptyDisplay}>
                      <div className={styles.emptyObject}><span>+</span></div>
                      <div><strong>First release slot</strong><small>New systems will appear here automatically when published.</small></div>
                    </div>
                  )}
                </div>
                <div className={styles.shelfBoard}/>
                <div className={styles.shelfLight}/>
              </div>
            </div>
          );
        })}
      </section>

      <section className={styles.storeFooter}>
        <p>Each product has its own focused page for campaigns, search and direct sharing.</p>
        <span>DISCOVER → REVIEW → WHOP CHECKOUT → DELIVERY</span>
      </section>

      {selected && (
        <div className={styles.modalBackdrop} onClick={() => setSelected(null)}>
          <article className={styles.productModal} onClick={(event) => event.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelected(null)} aria-label="Close"><X/></button>
            <div className={styles.modalVisual}>
              {selected.imageUrl ? <img src={selected.imageUrl} alt=""/> : <span className={styles.generatedCover}><small>{selected.format}</small><strong>{selected.name}</strong><em>G$LIDE</em></span>}
            </div>
            <div className={styles.modalCopy}>
              <p className={styles.eyebrow}>{selected.shelf} / {selected.format}</p>
              <h2>{selected.name}</h2>
              <p>{selected.summary}</p>
              {selected.transformation && <blockquote>{selected.transformation}</blockquote>}
              <div className={styles.modalActions}>
                {selected.priceText && <strong>{selected.priceText}</strong>}
                <Link href={`/ventures/market-systems/${selected.slug}`}>View system <ArrowUpRight size={16}/></Link>
                {selected.whopUrl && <a href={selected.whopUrl} target="_blank" rel="noreferrer">Get it on Whop <ArrowUpRight size={16}/></a>}
              </div>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
