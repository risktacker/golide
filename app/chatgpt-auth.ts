import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type GolideUser = { displayName: string; email: string; id: string };
export type SupabaseAuthUser = { id?: string; email?: string; user_metadata?: Record<string, unknown> | null };

const SESSION_COOKIE = "golide-session-v1";
const AUTH_RETURN_COOKIE = "golide-auth-return-v1";
const AUTH_ORIGIN_COOKIE = "golide-auth-origin-v1";
const AUTH_VERIFIER_COOKIE = "golide-auth-verifier-v1";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const ADMIN_EMAILS = new Set(["esiahkapinga@gmail.com", "esiahsbusiness@gmail.com"]);

export function getSupabasePublicConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!rawUrl || !publishableKey) throw new Error("GOLIDE authentication is not configured.");
  const url = rawUrl.replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
  return { url, publishableKey };
}

async function ensureAuthTable() {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS golide_auth_sessions (
      session_hash TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `).run();
}

async function sha256Bytes(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return new Uint8Array(digest);
}

async function sha256(value: string) {
  return Array.from(await sha256Bytes(value)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomToken(byteLength = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function createPkcePair() {
  const verifier = randomToken(32);
  const challenge = base64Url(await sha256Bytes(verifier));
  return { verifier, challenge };
}

function cookieDomain(requestUrl?: string) {
  if (!requestUrl) return undefined;
  try {
    const hostname = new URL(requestUrl).hostname.toLowerCase();
    return hostname === "golidee.com" || hostname.endsWith(".golidee.com") ? ".golidee.com" : undefined;
  } catch { return undefined; }
}

function secureCookieOptions(requestUrl?: string, maxAge = SESSION_TTL_SECONDS) {
  const domain = cookieDomain(requestUrl);
  let secure = true;
  try { if (requestUrl) secure = new URL(requestUrl).protocol === "https:"; } catch { secure = true; }
  return { httpOnly: true, sameSite: "lax" as const, secure, path: "/", maxAge, ...(domain ? { domain } : {}) };
}

export function toGolideUser(user: SupabaseAuthUser | null | undefined): GolideUser | null {
  const id = typeof user?.id === "string" ? user.id.trim() : "";
  const email = typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";
  if (!id || !email) return null;
  const metadata = user?.user_metadata || {};
  const candidates = [metadata.full_name, metadata.name, metadata.preferred_username];
  const displayName = candidates.find((value) => typeof value === "string" && value.trim()) as string | undefined;
  return { id, email, displayName: displayName?.trim() || email };
}

export async function createGolideSession(user: GolideUser, requestUrl?: string) {
  await ensureAuthTable();
  const token = randomToken();
  const hash = await sha256(token);
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_SECONDS * 1000;
  await env.DB.prepare(`
    INSERT INTO golide_auth_sessions (session_hash, user_id, email, display_name, created_at, expires_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6)
    ON CONFLICT(session_hash) DO UPDATE SET user_id=excluded.user_id,email=excluded.email,display_name=excluded.display_name,created_at=excluded.created_at,expires_at=excluded.expires_at
  `).bind(hash, user.id, user.email, user.displayName, now, expiresAt).run();
  (await cookies()).set(SESSION_COOKIE, token, secureCookieOptions(requestUrl));
}

export async function destroyGolideSession(requestUrl?: string) {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value || "";
  if (token) {
    try {
      await ensureAuthTable();
      await env.DB.prepare("DELETE FROM golide_auth_sessions WHERE session_hash = ?1").bind(await sha256(token)).run();
    } catch { /* Clearing the browser cookie below still signs this browser out. */ }
  }
  store.set(SESSION_COOKIE, "", secureCookieOptions(requestUrl, 0));
}

export async function getGolideUser(): Promise<GolideUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    await ensureAuthTable();
    const hash = await sha256(token);
    const row = await env.DB.prepare("SELECT user_id, email, display_name, expires_at FROM golide_auth_sessions WHERE session_hash = ?1")
      .bind(hash).first<{ user_id: string; email: string; display_name: string; expires_at: number }>();
    if (!row || row.expires_at <= Date.now()) {
      if (row) await env.DB.prepare("DELETE FROM golide_auth_sessions WHERE session_hash = ?1").bind(hash).run();
      return null;
    }
    return { id: row.user_id, email: row.email, displayName: row.display_name || row.email };
  } catch { return null; }
}

export function isAdminUser(user: GolideUser | null): boolean { return Boolean(user && ADMIN_EMAILS.has(user.email.trim().toLowerCase())); }

export async function requireGolideUser(returnTo: string): Promise<GolideUser> {
  const user = await getGolideUser();
  if (user) return user;
  redirect(loginPath(returnTo));
}

export async function requireAdmin(returnTo: string): Promise<GolideUser> {
  const user = await requireGolideUser(returnTo);
  if (!isAdminUser(user)) redirect("/admin-only");
  return user;
}

export function loginPath(returnTo = "/"): string { return `/login?returnTo=${encodeURIComponent(safeRelativePath(returnTo))}`; }

export function safeRelativePath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, "https://golidee.com");
    return url.origin === "https://golidee.com" ? `${url.pathname}${url.search}${url.hash}` : "/";
  } catch { return "/"; }
}

export function safeGolideOrigin(value: string | null, fallback: string): string {
  try {
    const url = new URL(value || fallback);
    const hostname = url.hostname.toLowerCase();
    if (url.protocol === "https:" && (hostname === "golidee.com" || hostname.endsWith(".golidee.com"))) return url.origin;
    const fallbackUrl = new URL(fallback);
    if (url.origin === fallbackUrl.origin) return url.origin;
  } catch { /* Use request origin. */ }
  return new URL(fallback).origin;
}

export async function setAuthFlowCookies(returnTo: string, origin: string, verifier: string, requestUrl: string) {
  const store = await cookies();
  const options = secureCookieOptions(requestUrl, 60 * 10);
  store.set(AUTH_RETURN_COOKIE, safeRelativePath(returnTo), options);
  store.set(AUTH_ORIGIN_COOKIE, safeGolideOrigin(origin, requestUrl), options);
  store.set(AUTH_VERIFIER_COOKIE, verifier, options);
}

export async function readAndClearAuthFlow(requestUrl: string) {
  const store = await cookies();
  const returnTo = safeRelativePath(store.get(AUTH_RETURN_COOKIE)?.value || "/");
  const origin = safeGolideOrigin(store.get(AUTH_ORIGIN_COOKIE)?.value || null, requestUrl);
  const verifier = store.get(AUTH_VERIFIER_COOKIE)?.value || "";
  const expired = secureCookieOptions(requestUrl, 0);
  store.set(AUTH_RETURN_COOKIE, "", expired);
  store.set(AUTH_ORIGIN_COOKIE, "", expired);
  store.set(AUTH_VERIFIER_COOKIE, "", expired);
  return { returnTo, origin, verifier };
}
