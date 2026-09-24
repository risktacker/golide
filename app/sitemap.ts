import type { MetadataRoute } from "next";

const base = "https://golidee.com";
const publicRoutes = [
  "",
  "/founder",
  "/research",
  "/privacy",
  "/terms",
  "/projects/syla",
  "/projects/malaria",
  "/projects/tinospora",
  "/projects/child-mortality",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.7,
  }));
}
