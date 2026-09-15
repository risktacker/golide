import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type GolideUser = { displayName: string; email: string; id: string };
const ADMIN_EMAIL = "esiahkapinga@gmail.com";

export function getSupabasePublicConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!rawUrl || !key) throw new Error("GOLIDE authentication is not configured.");
  const url = rawUrl.replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
  return { url, publishableKey: key };
}

export async function createSupabaseServerClient() {
  const { url, publishableKey } = getSupabasePublicConfig();
  const cookieStore = await cookies();
  return createServerClient(url, publishableKey, {
    cookieOptions: { domain: ".golidee.com", path: "/", sameSite: "lax", secure: true },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => {
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. Route handlers can.
        }
      },
    },
  });
}

function toGolideUser(user: User): GolideUser | null {
  const email = user.email?.trim().toLowerCase();
  if (!email) return null;
  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  return { id: user.id, email, displayName: fullName || email };
}

export async function getGolideUser(): Promise<GolideUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return toGolideUser(data.user);
}

export function isAdminUser(user: GolideUser | null): boolean {
  return user?.email === ADMIN_EMAIL;
}

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

export function loginPath(returnTo = "/"): string {
  return `/login?returnTo=${encodeURIComponent(safeRelativePath(returnTo))}`;
}

export function safeRelativePath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, "https://golidee.com");
    return url.origin === "https://golidee.com" ? `${url.pathname}${url.search}${url.hash}` : "/";
  } catch {
    return "/";
  }
}
