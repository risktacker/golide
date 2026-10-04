import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getGolideUser, isAdminUser } from "../../../chatgpt-auth";

// TEMPORARY — one-time data export for the ChatGPT Sites → Cloudflare move.
// Admin-only, read-only. Remove after the import into Cloudflare D1 is verified.

export const dynamic = "force-dynamic";

// Login sessions are not exported: they hold session hashes and are recreated
// on the next login anyway.
const SKIP = new Set(["golide_auth_sessions", "d1_migrations"]);

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function encodeValue(value: unknown) {
  if (value instanceof Uint8Array) return { __b64: toBase64(value) };
  if (value instanceof ArrayBuffer) return { __b64: toBase64(new Uint8Array(value)) };
  return value;
}

export async function GET() {
  const user = await getGolideUser();
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
  }

  const master = await env.DB.prepare(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name",
  ).all<{ name: string; sql: string }>();

  const tables: Record<string, { sql: string; blobColumns: string[]; rows: Record<string, unknown>[] }> = {};
  for (const table of master.results ?? []) {
    if (SKIP.has(table.name)) continue;
    const columns = await env.DB.prepare(`PRAGMA table_info("${table.name.replace(/"/g, '""')}")`)
      .all<{ name: string; type: string }>();
    const blobColumns = (columns.results ?? [])
      .filter((column) => /BLOB/i.test(column.type || ""))
      .map((column) => column.name);
    const result = await env.DB.prepare(`SELECT * FROM "${table.name.replace(/"/g, '""')}"`).all<Record<string, unknown>>();
    const rows = (result.results ?? []).map((row) => {
      const out: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        out[key] = blobColumns.includes(key) && Array.isArray(value)
          ? { __b64: toBase64(Uint8Array.from(value as number[])) }
          : encodeValue(value);
      }
      return out;
    });
    tables[table.name] = { sql: table.sql, blobColumns, rows };
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return new NextResponse(
    JSON.stringify({ format: "golide-d1-export-v1", exportedAt: new Date().toISOString(), tables }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="golide-export-${stamp}.json"`,
        "cache-control": "no-store",
      },
    },
  );
}
