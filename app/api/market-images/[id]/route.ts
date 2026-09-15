import { env } from "cloudflare:workers";
import { ensureMarketTable } from "../../../ventures/market-systems/market-data";

type Props = { params: Promise<{ id: string }> };

type ImageRow = {
  content_type: string;
  data: ArrayBuffer | Uint8Array | number[];
};

function normaliseImageBytes(data: ImageRow["data"]): Uint8Array | null {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (Array.isArray(data)) return Uint8Array.from(data);
  return null;
}

export async function GET(_request: Request, { params }: Props) {
  await ensureMarketTable();
  const { id } = await params;

  const row = await env.DB.prepare(
    "SELECT content_type, data FROM market_images WHERE id = ?1"
  ).bind(id).first<ImageRow>();

  if (!row?.data) {
    return new Response("Image not found", { status: 404 });
  }

  const bytes = normaliseImageBytes(row.data);
  if (!bytes?.byteLength) {
    return new Response("Image not found", { status: 404 });
  }

  const body = new Uint8Array(bytes.byteLength);
  body.set(bytes);

  return new Response(body.buffer, {
    headers: {
      "content-type": row.content_type,
      "content-length": String(body.byteLength),
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
