import type { Metadata } from "next";
import { Footer, Header } from "../../shared";
import MarketClient from "./market-client";
import { listPublishedProducts } from "./market-data";
import styles from "./market.module.css";

export const metadata: Metadata = {
  title: "Digital Marketplace",
  description: "A curated marketplace of practical digital toolkits, playbooks and learning systems, delivered through Whop.",
  alternates: { canonical: "/ventures/market-systems" },
  openGraph: { url: "/ventures/market-systems", title: "GOLIDE Digital Marketplace", description: "Practical digital toolkits, playbooks and learning systems built to help people decide, act and improve.", images: ["/og.webp"] },
  twitter: { card: "summary_large_image", title: "GOLIDE Digital Marketplace", description: "Practical digital toolkits, playbooks and learning systems.", images: ["/og.webp"] },
};

type Props = { searchParams: Promise<{ publisher?: string }> };

export default async function Page({ searchParams }: Props) {
  const products = await listPublishedProducts();
  const query = await searchParams;
  const canManage = query.publisher === "1";

  const marketplaceData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "GOLIDE Digital Marketplace",
    url: "https://golidee.com/ventures/market-systems",
    mainEntity: { "@type": "ItemList", itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, url: `https://golidee.com/ventures/market-systems/${product.slug}`, name: product.name })) },
  };

  return <main className={styles.marketPage}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceData).replace(/</g, "\\u003c") }} />
    <Header/>
    <div className={styles.marketShell}>
      <MarketClient products={products} canManage={canManage}/>
    </div>
    <Footer/>
  </main>;
}
