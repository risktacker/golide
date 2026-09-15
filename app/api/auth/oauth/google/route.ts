import { NextResponse } from "next/server";
import { createPkcePair, getSupabasePublicConfig, safeRelativePath, setAuthFlowCookies } from "../../../../chatgpt-auth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const returnTo = safeRelativePath(requestUrl.searchParams.get("returnTo"));
  let config: ReturnType<typeof getSupabasePublicConfig>;
  try { config = getSupabasePublicConfig(); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Authentication is unavailable." }, { status: 503 }); }

  const configuredCallback = process.env.GOLIDE_AUTH_CALLBACK_URL || process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL;
  const isGolideHost = requestUrl.hostname === "golidee.com" || requestUrl.hostname.endsWith(".golidee.com");
  const callbackUrl = configuredCallback || (isGolideHost ? "https://golidee.com/auth/oauth-callback" : `${requestUrl.origin}/auth/oauth-callback`);
  const { verifier, challenge } = await createPkcePair();
  await setAuthFlowCookies(returnTo, requestUrl.origin, verifier, request.url);

  const authorize = new URL(`${config.url}/auth/v1/authorize`);
  authorize.searchParams.set("provider", "google");
  authorize.searchParams.set("redirect_to", callbackUrl);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "s256");
  return NextResponse.redirect(authorize);
}
