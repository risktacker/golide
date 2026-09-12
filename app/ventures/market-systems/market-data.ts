import { asc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { marketProducts } from "../../../db/schema";

export type MarketProduct = typeof marketProducts.$inferSelect;

export const MARKET_SHELVES = ["Career", "Creator", "Business", "Productivity", "Learning"] as const;

type LegacyImageRow = { id: string; image_url: string; updated_at: number };

async function migrateLegacyMarketImages() {
  const result = await env.DB.prepare(
    "SELECT id, image_url, updated_at FROM market_products WHERE image_url LIKE 'data:image/%' LIMIT 20"
  ).all<LegacyImageRow>();

  for (const row of result.results ?? []) {
    const match = row.image_url.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/i);
    if (!match) continue;
    const contentType = `image/${match[1].toLowerCase()}`;
    const binary = Uint8Array.from(atob(match[2]), (character) => character.charCodeAt(0));
    const imageUrl = `/api/market-images/${encodeURIComponent(row.id)}?v=${row.updated_at}`;

    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO market_images (id, content_type, data, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ON CONFLICT(id) DO UPDATE SET
          content_type = excluded.content_type,
          data = excluded.data,
          updated_at = excluded.updated_at
      `).bind(row.id, contentType, binary.buffer, row.updated_at, row.updated_at),
      env.DB.prepare("UPDATE market_products SET image_url = ?1 WHERE id = ?2").bind(imageUrl, row.id),
    ]);
  }
}

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
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS market_images (
      id TEXT PRIMARY KEY NOT NULL,
      content_type TEXT NOT NULL,
      data BLOB NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS market_products_published_idx ON market_products (published, shelf, sort_order)").run();
  await migrateLegacyMarketImages();
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
