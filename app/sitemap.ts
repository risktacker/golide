import type { MetadataRoute } from "next";
import { listPublishedProducts } from "./ventures/market-systems/market-data";

const base = "https://golidee.com";
const publicRoutes = [
  "",
  "/founder",
  "/portfolio",
  "/research",
  "/projects/syla",
  "/projects/malaria",
  "/projects/tinospora",
  "/projects/child-mortality",
  "/ventures/market-systems",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listPublishedProducts();
  return [
    ...publicRoutes.map((route) => ({
      url: `${base}${route}`,
      changeFrequency: route === "/ventures/market-systems" ? "weekly" as const : "monthly" as const,
      priority: route === "" ? 1 : route === "/ventures/market-systems" ? 0.9 : 0.7,
    })),
    ...products.map((product) => ({
      url: `${base}/ventures/market-systems/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
