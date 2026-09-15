"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Cpu,
  GraduationCap,
  LayoutGrid,
  Pencil,
  Search,
  ShoppingBag,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type { MarketProduct } from "./market-data";
import { marketplaceProductPath } from "./market-links";
import styles from "./storefront.module.css";

type Props = {
  products: MarketProduct[];
  canManage: boolean;
};

type ShelfStyle = CSSProperties & {
  "--accent": string;
  "--accent-rgb": string;
};

const shelves = [
  { name: "Career", strap: "Get hired. Go further.", accent: "#2ddcff", rgb: "45 220 255", icon: BriefcaseBusiness },
  { name: "Creator", strap: "Turn ideas into output.", accent: "#bb6cff", rgb: "187 108 255", icon: Sparkles },
  { name: "Business", strap: "Build what comes next.", accent: "#ffb84f", rgb: "255 184 79", icon: Building2 },
  { name: "Productivity", strap: "Do more. Move better.", accent: "#2ce2a0", rgb: "44 226 160", icon: Zap },
  { name: "Learning", strap: "Skills for tomorrow.", accent: "#f2d767", rgb: "242 215 103", icon: GraduationCap },
] as const;

function ProductCard({ product, accent, rgb, onOpen, canManage }: { product: MarketProduct; accent: string; rgb: string; onOpen: () => void; canManage: boolean }) {
  const style = { "--accent": accent, "--accent-rgb": rgb } as ShelfStyle;

  return (
    <article className={styles.productCard} style={style}>
      <button className={styles.productVisual} type="button" onClick={onOpen} aria-label={`Preview ${product.name}`}>
        <span className={styles.productHalo}/>
        {product.imageUrl ? (
          <img className={styles.productImage} src={product.imageUrl} alt={`${product.name} product preview`}/>
        ) : (
          <span className={styles.generatedCover}>
            <small>{product.format}</small>
            <strong>{product.name}</strong>
            <em>GOLIDE</em>
          </span>
        )}
        {product.featured && <span className={styles.featuredTag}>FEATURED</span>}
      </button>

      <div className={styles.productCopy}>
        <div className={styles.productMeta}>
          <span>{product.format}</span>
          {product.priceText && <strong>{product.priceText}</strong>}
        </div>
        <h3><Link href={marketplaceProductPath(product.slug)}>{product.name}</Link></h3>
        <p>{product.summary}</p>
        <div className={styles.productActions}>
          <Link className={styles.viewButton} href={marketplaceProductPath(product.slug)}>View <ArrowRight size={15}/></Link>
          {product.whopUrl ? (
            <a className={styles.buyButton} href={product.whopUrl} target="_blank" rel="noreferrer">Get access <ArrowUpRight size={15}/></a>
          ) : (
            <Link className={styles.buyButton} href={marketplaceProductPath(product.slug)}>Get details <ArrowRight size={15}/></Link>
          )}
        </div>
      </div>

      {canManage && (
        <Link className={styles.editProduct} href={`/manage?edit=${encodeURIComponent(product.id)}`} aria-label={`Edit ${product.name}`}>
          <Pencil size={12}/> Edit
        </Link>
      )}
    </article>
  );
}

export default function MarketClient({ products, canManage }: Props) {
  const [selected, setSelected] = useState<MarketProduct | null>(null);
  const [activeShelf, setActiveShelf] = useState("All");
  const [query, setQuery] = useState("");

  const heroProduct = products.find((product) => product.featured) ?? products[0] ?? null;

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) => [product.name, product.summary, product.shelf, product.format]
      .some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [products, query]);

  const visibleShelves = useMemo(() => {
    const base = activeShelf === "All" ? shelves : shelves.filter((shelf) => shelf.name === activeShelf);
    if (activeShelf !== "All") return base;
    return base.filter((shelf) => canManage || filteredProducts.some((product) => product.shelf === shelf.name));
  }, [activeShelf, filteredProducts, canManage]);

  return (
    <>
      <section className={styles.marketHero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><Sparkles size={14}/> GOLIDE MARKETPLACE</p>
          <h1>Digital products.<br/><span>Built for real progress.</span></h1>
          <p className={styles.intro}>Practical tools, playbooks and software for career, business, creativity, productivity and learning.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryHeroButton} href="#market-shelves">Browse products <ArrowRight size={17}/></a>
            {canManage && <Link className={styles.secondaryHeroButton} href="/manage">Add product <ArrowUpRight size={16}/></Link>}
          </div>
          <div className={styles.heroNotes}>
            <span>Instant digital access</span>
            <span>Secure Whop checkout</span>
            <span>Global delivery</span>
          </div>
        </div>

        <div className={styles.heroScene} aria-label="GOLIDE digital product display">
          <div className={`${styles.iconCube} ${styles.cubeCareer}`}><BriefcaseBusiness/></div>
          <div className={`${styles.iconCube} ${styles.cubeCreator}`}><Sparkles/></div>
          <div className={`${styles.iconCube} ${styles.cubeBusiness}`}><Building2/></div>
          <div className={`${styles.iconCube} ${styles.cubeLearning}`}><BookOpen/></div>
          <div className={`${styles.iconCube} ${styles.cubeTech}`}><Cpu/></div>
          <div className={`${styles.iconCube} ${styles.cubeShop}`}><ShoppingBag/></div>
          <div className={styles.heroProductObject}>
            {heroProduct?.imageUrl ? (
              <img src={heroProduct.imageUrl} alt={`${heroProduct.name} featured product`}/>
            ) : (
              <span className={styles.heroFallback}><small>DIGITAL PRODUCT</small><strong>Build what comes next.</strong><em>GOLIDE</em></span>
            )}
          </div>
          <div className={styles.heroShelf}>
            <span className={styles.heroShelfGlow}/>
          </div>
        </div>
      </section>

      <section className={styles.storeToolbar} aria-label="Marketplace controls">
        <div className={styles.filters}>
          <button className={activeShelf === "All" ? styles.activeFilter : ""} onClick={() => setActiveShelf("All")}>
            <LayoutGrid size={15}/> All
          </button>
          {shelves.map((shelf) => {
            const Icon = shelf.icon;
            return (
              <button
                key={shelf.name}
                className={activeShelf === shelf.name ? styles.activeFilter : ""}
                onClick={() => setActiveShelf(shelf.name)}
                style={{ "--chip-accent": shelf.accent } as CSSProperties}
              >
                <Icon size={15}/>{shelf.name}
              </button>
            );
          })}
        </div>
        <label className={styles.searchBox}>
          <Search size={16}/>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search marketplace products"/>
        </label>
      </section>

      <section id="market-shelves" className={styles.storeRoom} aria-label="GOLIDE product shelves">
        {visibleShelves.length > 0 ? visibleShelves.map((shelf) => {
          const Icon = shelf.icon;
          const items = filteredProducts.filter((product) => product.shelf === shelf.name);
          const style = { "--accent": shelf.accent, "--accent-rgb": shelf.rgb } as ShelfStyle;
          return (
            <section className={styles.shelfZone} style={style} key={shelf.name}>
              <div className={styles.shelfAtmosphere}/>
              <header className={styles.shelfHeading}>
                <div className={styles.shelfTitleGroup}>
                  <span className={styles.shelfIcon}><Icon size={20}/></span>
                  <div><h2>{shelf.name}</h2><p>{shelf.strap}</p></div>
                </div>
                <small>{items.length ? `${String(items.length).padStart(2, "0")} PRODUCTS` : "NEXT RELEASE SOON"}</small>
              </header>

              <div className={styles.shelfStage}>
                <div className={styles.shelfProducts}>
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} accent={shelf.accent} rgb={shelf.rgb} canManage={canManage} onOpen={() => setSelected(product)}/>
                  ))}
                  {!items.length && (
                    <div className={styles.emptyShelf}>
                      <div className={styles.emptyObject}><span>+</span></div>
                      <div>
                        <strong>{query ? "No matching products" : "Next release is being prepared"}</strong>
                        <small>{query ? "Try a different search or category." : `${shelf.name} products will appear here when released.`}</small>
                        {canManage && !query && <Link href={`/manage?shelf=${encodeURIComponent(shelf.name)}`}>Add first release <ArrowUpRight size={13}/></Link>}
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.shelfBoard}>
                  <span className={styles.shelfTop}/>
                  <span className={styles.shelfEdge}/>
                  <span className={styles.shelfUnderGlow}/>
                </div>
              </div>
            </section>
          );
        }) : (
          <div className={styles.noResults}><Search size={22}/><strong>No products match that search.</strong><span>Try another word or clear the search.</span></div>
        )}
      </section>

      <section className={styles.marketPromise}>
        <div><strong>Useful first.</strong><span>Products built around a clear problem.</span></div>
        <div><strong>Immediate access.</strong><span>Digital delivery after checkout.</span></div>
        <div><strong>One marketplace.</strong><span>Career, business, creator and learning systems.</span></div>
      </section>

      {selected && (
        <div className={styles.modalBackdrop} onClick={() => setSelected(null)}>
          <article className={styles.productModal} onClick={(event) => event.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelected(null)} aria-label="Close"><X size={18}/></button>
            <div className={styles.modalVisual}>
              {selected.imageUrl ? <img src={selected.imageUrl} alt={`${selected.name} product preview`}/> : <span className={styles.generatedCover}><small>{selected.format}</small><strong>{selected.name}</strong><em>GOLIDE</em></span>}
            </div>
            <div className={styles.modalCopy}>
              <p className={styles.eyebrow}>{selected.shelf} / {selected.format}</p>
              <h2>{selected.name}</h2>
              <p>{selected.summary}</p>
              {selected.transformation && <blockquote>{selected.transformation}</blockquote>}
              <div className={styles.modalActions}>
                {selected.priceText && <strong>{selected.priceText}</strong>}
                <Link href={marketplaceProductPath(selected.slug)}>View details <ArrowRight size={15}/></Link>
                {selected.whopUrl && <a className={styles.modalBuy} href={selected.whopUrl} target="_blank" rel="noreferrer">Get access <ArrowUpRight size={16}/></a>}
              </div>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
