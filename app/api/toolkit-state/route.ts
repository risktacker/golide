import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getGolideUser } from "../../chatgpt-auth";

const MAX_STATE_BYTES = 300_000;

async function ensureTable() {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS toolkit_user_state (
      user_id TEXT PRIMARY KEY NOT NULL,
      state_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();
}

async function userKey(email: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.trim().toLowerCase()));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function GET() {
  const user = await getGolideUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401, headers: { "cache-control": "no-store" } });

  await ensureTable();
  const key = await userKey(user.email);
  const row = await env.DB.prepare("SELECT state_json, updated_at FROM toolkit_user_state WHERE user_id = ?1")
    .bind(key)
    .first<{ state_json: string; updated_at: number }>();

  let state: unknown = null;
  if (row?.state_json) {
    try { state = JSON.parse(row.state_json); } catch { state = null; }
  }

  return NextResponse.json({
    user: { displayName: user.displayName, email: user.email },
    state,
    updatedAt: row?.updated_at ?? 0,
  }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  const user = await getGolideUser();
  if (!user) return NextResponse.json({ error: "Sign in to sync your toolkit." }, { status: 401 });

  const body = await request.json().catch(() => null) as { state?: unknown } | null;
  if (!body || !body.state || typeof body.state !== "object") {
    return NextResponse.json({ error: "Toolkit state is required." }, { status: 400 });
  }

  const stateJson = JSON.stringify(body.state);
  if (new TextEncoder().encode(stateJson).byteLength > MAX_STATE_BYTES) {
    return NextResponse.json({ error: "Toolkit data is too large to sync." }, { status: 413 });
  }

  await ensureTable();
  const key = await userKey(user.email);
  const now = Date.now();
  await env.DB.prepare(`
    INSERT INTO toolkit_user_state (user_id, state_json, updated_at)
    VALUES (?1, ?2, ?3)
    ON CONFLICT(user_id) DO UPDATE SET
      state_json = excluded.state_json,
      updated_at = excluded.updated_at
  `).bind(key, stateJson, now).run();

  return NextResponse.json({ ok: true, updatedAt: now });
}
