import type { MetadataRoute } from "next";
import { listPublishedProducts } from "./ventures/market-systems/market-data";
import { MARKETPLACE_ORIGIN, marketplaceProductUrl } from "./ventures/market-systems/market-links";

// Only final, canonical, indexable URLs belong here. Never list a URL that
// redirects (worker/index.ts sends /content-engine to studio.golidee.com and
// /ventures/market-systems/* to marketplace.golidee.com) or one marked noindex
// (/partners, /login, /manage). Search Console flags those as "Page with redirect".
// Cross-host entries for marketplace.golidee.com are valid because golidee.com
// is verified as a Domain property, which covers every subdomain.
const base = "https://golidee.com";
const hubRoutes = [
  "/",
  "/founder",
  "/research",
  "/privacy",
  "/terms",
  "/projects/syla",
  "/projects/malaria",
  "/projects/tinospora",
  "/projects/child-mortality",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listPublishedProducts();
  const newestProduct = products.reduce<Date | undefined>((latest, product) => {
    const updated = new Date(product.updatedAt);
    return !latest || updated > latest ? updated : latest;
  }, undefined);

  return [
    ...hubRoutes.map((route) => ({ url: `${base}${route}` })),
    { url: `${MARKETPLACE_ORIGIN}/`, ...(newestProduct ? { lastModified: newestProduct } : {}) },
    ...products.map((product) => ({
      url: marketplaceProductUrl(product.slug),
      lastModified: new Date(product.updatedAt),
    })),
  ];
}
