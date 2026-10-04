import { NextResponse } from "next/server";
import { createGolideSession, getSupabasePublicConfig, toGolideUser } from "../../../chatgpt-auth";

// Final step of the reset flow: the reset page sends the one-time recovery
// access token from the email link plus the new password. Supabase verifies
// the token; on success the user is signed in to GOLIDE.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { accessToken?: unknown; password?: unknown } | null;
  const accessToken = typeof body?.accessToken === "string" ? body.accessToken.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!accessToken) return NextResponse.json({ error: "This reset link is invalid. Request a new one." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Use at least 6 characters." }, { status: 400 });

  let config: ReturnType<typeof getSupabasePublicConfig>;
  try { config = getSupabasePublicConfig(); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Authentication is unavailable." }, { status: 503 }); }

  const response = await fetch(`${config.url}/auth/v1/user`, {
    method: "PUT",
    headers: { apikey: config.publishableKey, authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
    body: JSON.stringify({ password }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof payload.msg === "string" ? payload.msg
      : typeof payload.message === "string" ? payload.message
      : typeof payload.error_description === "string" ? payload.error_description
      : "This reset link has expired. Request a new one.";
    return NextResponse.json({ error: message }, { status: response.status >= 400 && response.status < 500 ? response.status : 502 });
  }

  const user = toGolideUser(payload as Parameters<typeof toGolideUser>[0]);
  if (user) await createGolideSession(user, request.url);
  return NextResponse.json({ ok: true, signedIn: Boolean(user) });
}
