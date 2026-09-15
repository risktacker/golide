import { NextResponse } from "next/server";
import { createGolideSession, getSupabasePublicConfig, safeRelativePath, toGolideUser } from "../../../chatgpt-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown; password?: unknown; mode?: unknown; returnTo?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const mode = body?.mode === "signup" ? "signup" : "signin";
  const returnTo = safeRelativePath(typeof body?.returnTo === "string" ? body.returnTo : "/");
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

  let config: ReturnType<typeof getSupabasePublicConfig>;
  try { config = getSupabasePublicConfig(); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Authentication is unavailable." }, { status: 503 }); }

  const endpoint = mode === "signup" ? `${config.url}/auth/v1/signup` : `${config.url}/auth/v1/token?grant_type=password`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { apikey: config.publishableKey, "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof payload.msg === "string" ? payload.msg : typeof payload.message === "string" ? payload.message : typeof payload.error_description === "string" ? payload.error_description : "Could not sign in.";
    return NextResponse.json({ error: message }, { status: response.status >= 400 && response.status < 500 ? response.status : 502 });
  }

  const user = toGolideUser(payload.user as Parameters<typeof toGolideUser>[0]);
  const accessToken = typeof payload.access_token === "string" ? payload.access_token : "";
  if (mode === "signup" && (!user || !accessToken)) {
    return NextResponse.json({ ok: true, confirmationRequired: true, message: "Check your email to confirm your account, then sign in." });
  }
  if (!user) return NextResponse.json({ error: "Supabase did not return a usable user account." }, { status: 502 });

  await createGolideSession(user, request.url);
  return NextResponse.json({ ok: true, returnTo });
}
