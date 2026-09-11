"use client";

import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Layers3, Pencil, Sparkles, X } from "lucide-react";
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

function ProductObject({ product, onOpen, canManage }: { product: MarketProduct; onOpen: () => void; canManage: boolean }) {
  const format = product.format.toLowerCase();
  const shapeClass = format.includes("tool") || format.includes("template")
    ? styles.toolkit
    : format.includes("course") || format.includes("video")
      ? styles.screen
      : styles.book;

  return (
    <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
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
      {canManage && (
        <Link
          href={`/ventures/market-systems/manage?edit=${encodeURIComponent(product.id)}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 10px",
            borderRadius: 999,
            border: "1px solid rgba(113,239,255,.28)",
            background: "rgba(113,239,255,.08)",
            color: "#71efff",
            textDecoration: "none",
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: ".05em",
            whiteSpace: "nowrap",
          }}
        >
          <Pencil size={11}/> Edit product
        </Link>
      )}
    </div>
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
                  {items.map((product) => <ProductObject key={product.id} product={product} canManage={canManage} onOpen={() => setSelected(product)}/>) }
                  {!items.length && (
                    canManage ? (
                      <Link
                        className={styles.emptyDisplay}
                        href={`/ventures/market-systems/manage?shelf=${encodeURIComponent(shelf.name)}`}
                        style={{ textDecoration: "none" }}
                        aria-label={`Add first product to ${shelf.name}`}
                      >
                        <div className={styles.emptyObject}><span>+</span></div>
                        <div><strong>Add first release</strong><small>Open the publisher with {shelf.name} selected.</small></div>
                      </Link>
                    ) : (
                      <div className={styles.emptyDisplay}>
                        <div className={styles.emptyObject}><span>+</span></div>
                        <div><strong>First release slot</strong><small>New systems will appear here automatically when published.</small></div>
                      </div>
                    )
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
                {canManage && <Link href={`/ventures/market-systems/manage?edit=${encodeURIComponent(selected.id)}`}>Edit product <Pencil size={14}/></Link>}
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
