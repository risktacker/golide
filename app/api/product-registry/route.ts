import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { listPublishedProducts } from "../../ventures/market-systems/market-data";
import { marketplaceProductUrl } from "../../ventures/market-systems/market-links";

export const dynamic = "force-dynamic";

async function coverage(productId: string) {
  try {
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM partner_product_matches WHERE product_id=?1"
    ).bind(productId).first<{ count: number }>();
    return Number(row?.count || 0);
  } catch {
    return 0;
  }
}

export async function GET() {
  const products = (await listPublishedProducts()).filter((product) => product.lifecycleStatus !== "PAUSED");
  const coverageValues = await Promise.all(products.map((product) => coverage(product.id)));
  return NextResponse.json({
    version: 1,
    source: "GOLIDE Marketplace",
    products: products.map((product, index) => ({
        id: product.id,
        name: product.name,
        lifecycle_status: product.lifecycleStatus || "ACTIVE",
        target_audience: product.targetAudience || "",
        problem_solved: product.problemSolved || product.summary || "",
        marketplace_url: marketplaceProductUrl(product.slug),
        keywords: (product.keywords || "").split(",").map((value) => value.trim()).filter(Boolean),
        creator_niches: (product.creatorNiches || "").split(",").map((value) => value.trim()).filter(Boolean),
        target_geographies: (product.targetGeographies || "").split(",").map((value) => value.trim()).filter(Boolean),
        priority: product.priority ?? 50,
        affiliate_rate: product.affiliateRate ?? 0,
        launch_date: product.launchDate || "",
        partner_coverage: coverageValues[index] || 0,
        recent_post_count: 0,
        paused: false,
      })),
  }, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
