import { NextResponse } from "next/server";
import { createGolideSession, getSupabasePublicConfig, readAndClearAuthFlow, toGolideUser } from "../../../../chatgpt-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { code?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code : "";
  if (!code) return NextResponse.json({ error: "Missing OAuth authorization code." }, { status: 400 });

  const flow = await readAndClearAuthFlow(request.url);
  if (!flow.verifier) return NextResponse.json({ error: "The sign-in session expired. Start Google sign-in again." }, { status: 400 });

  let config: ReturnType<typeof getSupabasePublicConfig>;
  try { config = getSupabasePublicConfig(); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Authentication is unavailable." }, { status: 503 }); }

  const response = await fetch(`${config.url}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: { apikey: config.publishableKey, "content-type": "application/json" },
    body: JSON.stringify({ auth_code: code, code_verifier: flow.verifier }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof payload.msg === "string" ? payload.msg : typeof payload.message === "string" ? payload.message : "Google sign-in could not be verified.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
  const user = toGolideUser(payload.user as Parameters<typeof toGolideUser>[0]);
  if (!user) return NextResponse.json({ error: "Google sign-in did not return a usable account." }, { status: 502 });

  await createGolideSession(user, request.url);
  return NextResponse.json({ ok: true, returnTo: new URL(flow.returnTo, flow.origin).toString() });
}
