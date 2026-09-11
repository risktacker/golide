import { env } from "cloudflare:workers";
import { ensureMarketTable } from "../../../ventures/market-systems/market-data";

type Props = { params: Promise<{ id: string }> };

type ImageRow = {
  content_type: string;
  data: ArrayBuffer;
};

export async function GET(_request: Request, { params }: Props) {
  await ensureMarketTable();
  const { id } = await params;

  const row = await env.DB.prepare(
    "SELECT content_type, data FROM market_images WHERE id = ?1"
  ).bind(id).first<ImageRow>();

  if (!row?.data) {
    return new Response("Image not found", { status: 404 });
  }

  return new Response(row.data, {
    headers: {
      "content-type": row.content_type,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
