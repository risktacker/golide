import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getDb } from "../../../db";
import { marketProducts } from "../../../db/schema";
import { ensureMarketTable, listAllProducts } from "../../ventures/market-systems/market-data";

const ADMIN_HASH = "16cf4262b92f96f9cb9ee70cd3b538b8f499ea8a2d02bb4c0a5588cd8927e9ef";
const MAX_IMAGE_BYTES = 2_000_000;

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function authorized(passcode: unknown) {
  return typeof passcode === "string" && (await sha256(passcode)) === ADMIN_HASH;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72);
}

function text(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeWhopUrl(value: unknown) {
  const raw = text(value, 1000);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || !/(^|\.)whop\.com$/i.test(url.hostname)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function safeRemoteImageUrl(value: unknown) {
  const raw = text(value, 1200);
  if (!raw) return "";
  if (raw.startsWith("/")) return raw;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

async function persistImage(value: unknown, productId: string) {
  if (typeof value !== "string") return "";
  const raw = value.trim();
  if (!raw) return "";
  if (!raw.startsWith("data:image/")) return safeRemoteImageUrl(raw);

  const match = raw.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) return "";

  const mime = `image/${match[1].toLowerCase()}`;
  const binary = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
  if (binary.byteLength > MAX_IMAGE_BYTES) return "";

  const now = Date.now();
  await env.DB.prepare(`
    INSERT INTO market_images (id, content_type, data, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?5)
    ON CONFLICT(id) DO UPDATE SET
      content_type = excluded.content_type,
      data = excluded.data,
      updated_at = excluded.updated_at
  `).bind(productId, mime, binary.buffer, now, now).run();

  return `/api/market-images/${encodeURIComponent(productId)}?v=${now}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || !(await authorized(body.passcode))) {
    return NextResponse.json({ error: "Invalid publisher passcode." }, { status: 401 });
  }

  await ensureMarketTable();
  const db = getDb();
  const action = text(body.action, 30);

  if (action === "list") {
    return NextResponse.json({ products: await listAllProducts() });
  }

  if (action === "create") {
    const product = (body.product ?? {}) as Record<string, unknown>;
    const name = text(product.name, 120);
    const summary = text(product.summary, 700);
    if (!name || !summary) return NextResponse.json({ error: "Name and summary are required." }, { status: 400 });

    const now = Date.now();
    const baseSlug = slugify(text(product.slug, 90) || name) || `product-${now}`;
    const slug = `${baseSlug}-${String(now).slice(-5)}`;
    const id = crypto.randomUUID();
    const published = Boolean(product.published);
    const imageUrl = await persistImage(product.imageUrl, id);

    await db.insert(marketProducts).values({
      id,
      slug,
      name,
      shelf: text(product.shelf, 40) || "Business",
      format: text(product.format, 60) || "Toolkit",
      priceText: text(product.priceText, 40),
      summary,
      transformation: text(product.transformation, 1000),
      imageUrl,
      whopUrl: safeWhopUrl(product.whopUrl),
      featured: Boolean(product.featured),
      published,
      sortOrder: Number.isFinite(Number(product.sortOrder)) ? Math.trunc(Number(product.sortOrder)) : 0,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true, id, slug, published, imageUrl });
  }

  if (action === "update") {
    const id = text(body.id, 80);
    const product = (body.product ?? {}) as Record<string, unknown>;
    const name = text(product.name, 120);
    const summary = text(product.summary, 700);
    if (!id) return NextResponse.json({ error: "Missing product id." }, { status: 400 });
    if (!name || !summary) return NextResponse.json({ error: "Name and summary are required." }, { status: 400 });

    const imageUrl = await persistImage(product.imageUrl, id);

    await db.update(marketProducts).set({
      name,
      shelf: text(product.shelf, 40) || "Business",
      format: text(product.format, 60) || "Toolkit",
      priceText: text(product.priceText, 40),
      summary,
      transformation: text(product.transformation, 1000),
      imageUrl,
      whopUrl: safeWhopUrl(product.whopUrl),
      featured: Boolean(product.featured),
      published: Boolean(product.published),
      sortOrder: Number.isFinite(Number(product.sortOrder)) ? Math.trunc(Number(product.sortOrder)) : 0,
      updatedAt: Date.now(),
    }).where(eq(marketProducts.id, id));

    return NextResponse.json({ ok: true, imageUrl });
  }

  if (action === "toggle") {
    const id = text(body.id, 80);
    if (!id) return NextResponse.json({ error: "Missing product id." }, { status: 400 });
    await db.update(marketProducts).set({ published: Boolean(body.published), updatedAt: Date.now() }).where(eq(marketProducts.id, id));
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    const id = text(body.id, 80);
    if (!id) return NextResponse.json({ error: "Missing product id." }, { status: 400 });
    await db.delete(marketProducts).where(eq(marketProducts.id, id));
    await env.DB.prepare("DELETE FROM market_images WHERE id = ?1").bind(id).run();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
