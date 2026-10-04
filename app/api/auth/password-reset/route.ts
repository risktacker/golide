import { NextResponse } from "next/server";
import { getSupabasePublicConfig } from "../../../chatgpt-auth";

// Sends a Supabase password-recovery email. The reply is always the same
// generic message so the form cannot be used to discover which emails have
// accounts.
const GENERIC = "If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.";

function resetPageUrl(requestUrl: URL) {
  const host = requestUrl.hostname.toLowerCase();
  const isGolide = host === "golidee.com" || host.endsWith(".golidee.com");
  return isGolide ? "https://golidee.com/auth/reset-password" : `${requestUrl.origin}/auth/reset-password`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@") || email.length > 320) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  let config: ReturnType<typeof getSupabasePublicConfig>;
  try { config = getSupabasePublicConfig(); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Authentication is unavailable." }, { status: 503 }); }

  const recover = new URL(`${config.url}/auth/v1/recover`);
  recover.searchParams.set("redirect_to", resetPageUrl(new URL(request.url)));
  const response = await fetch(recover, {
    method: "POST",
    headers: { apikey: config.publishableKey, "content-type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });

  if (response.status === 429) {
    return NextResponse.json({ error: "Too many reset requests. Wait a few minutes and try again." }, { status: 429 });
  }
  return NextResponse.json({ ok: true, message: GENERIC });
}
