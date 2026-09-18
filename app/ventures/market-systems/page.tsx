import type { Metadata } from "next";
import { Footer, Header } from "../../shared";
import AmbientControl from "./ambient-control";
import MarketClient from "./market-client";
import { listPublishedProducts } from "./market-data";
import styles from "./storefront.module.css";
import { getGolideUser, isAdminUser } from "../../chatgpt-auth";
import { MARKETPLACE_ORIGIN, marketplaceProductUrl } from "./market-links";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Digital Products Marketplace: Tools, Templates & Software",
  description: "Explore practical digital products, toolkits, templates, playbooks, software and learning resources for career, business, creators and productivity.",
  keywords: ["digital products marketplace", "digital tools", "online toolkits", "business templates", "creator tools", "career tools", "productivity tools", "learning resources", "digital downloads", "software tools"],
  alternates: { canonical: `${MARKETPLACE_ORIGIN}/` },
  openGraph: { url: `${MARKETPLACE_ORIGIN}/`, title: "Digital Products Marketplace | GOLIDE", description: "Practical digital products, tools, templates, software and learning resources built for real problems.", images: ["/og.webp"] },
  twitter: { card: "summary_large_image", title: "Digital Products Marketplace | GOLIDE", description: "Practical digital products, tools, templates, software and learning resources.", images: ["/og.webp"] },
};

export default async function Page() {
  const products = await listPublishedProducts();
  const user = await getGolideUser();
  const canManage = isAdminUser(user);
  const showPartners = user?.email.trim().toLowerCase() === "esiahkapinga@gmail.com";

  const marketplaceData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "GOLIDE Digital Products Marketplace",
    description: "A marketplace for practical digital products, tools, templates, software and learning resources.",
    url: `${MARKETPLACE_ORIGIN}/`,
    mainEntity: { "@type": "ItemList", itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, url: marketplaceProductUrl(product.slug), name: product.name })) },
  };

  return <main className={styles.marketPage}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceData).replace(/</g, "\\u003c") }} />
    <Header utility={<AmbientControl/>}/>
    <div className={styles.marketShell}>
      <MarketClient products={products} canManage={canManage}/>
    </div>
    <Footer showPartners={showPartners}/>
  </main>;
}
