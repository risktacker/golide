import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/ventures/market-systems/manage"],
    },
    sitemap: "https://golidee.com/sitemap.xml",
    host: "https://golidee.com",
  };
}
