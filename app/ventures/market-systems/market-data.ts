import { asc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { marketProducts } from "../../../db/schema";

export type MarketProduct = typeof marketProducts.$inferSelect;

export const MARKET_SHELVES = ["Career", "Creator", "Business", "Productivity", "Learning"] as const;

export async function ensureMarketTable() {
  if (!env.DB) throw new Error("Marketplace database is unavailable.");
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS market_products (
      id TEXT PRIMARY KEY NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      shelf TEXT NOT NULL,
      format TEXT NOT NULL,
      price_text TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL,
      transformation TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      whop_url TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS market_products_published_idx ON market_products (published, shelf, sort_order)").run();
}

export async function listPublishedProducts(): Promise<MarketProduct[]> {
  try {
    await ensureMarketTable();
    return await getDb()
      .select()
      .from(marketProducts)
      .where(eq(marketProducts.published, true))
      .orderBy(asc(marketProducts.shelf), asc(marketProducts.sortOrder), asc(marketProducts.name));
  } catch {
    return [];
  }
}

export async function listAllProducts(): Promise<MarketProduct[]> {
  await ensureMarketTable();
  return getDb()
    .select()
    .from(marketProducts)
    .orderBy(asc(marketProducts.shelf), asc(marketProducts.sortOrder), asc(marketProducts.name));
}

export async function getPublishedProduct(slug: string): Promise<MarketProduct | null> {
  try {
    await ensureMarketTable();
    const rows = await getDb()
      .select()
      .from(marketProducts)
      .where(eq(marketProducts.slug, slug))
      .limit(1);
    const product = rows[0] ?? null;
    return product?.published ? product : null;
  } catch {
    return null;
  }
}
