import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type GolideUser = { displayName: string; email: string; id: string };

const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER = "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
const SIGN_IN_PATH = "/signin-with-chatgpt";
const SIGN_OUT_PATH = "/signout-with-chatgpt";
const CALLBACK_PATH = "/callback";
const ADMIN_EMAILS = new Set(["esiahkapinga@gmail.com", "esiahsbusiness@gmail.com"]);

export async function getGolideUser(): Promise<GolideUser | null> {
  const requestHeaders = await headers();
  const rawEmail = requestHeaders.get(USER_EMAIL_HEADER)?.trim().toLowerCase();
  if (!rawEmail) return null;

  const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
  const fullName = encodedFullName && requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
    ? safeDecodeURIComponent(encodedFullName)
    : encodedFullName;

  return {
    id: rawEmail,
    email: rawEmail,
    displayName: fullName?.trim() || rawEmail,
  };
}

export function isAdminUser(user: GolideUser | null): boolean {
  return Boolean(user && ADMIN_EMAILS.has(user.email));
}

export async function requireGolideUser(returnTo: string): Promise<GolideUser> {
  const user = await getGolideUser();
  if (user) return user;
  redirect(chatGPTSignInPath(returnTo));
}

export async function requireAdmin(returnTo: string): Promise<GolideUser> {
  const user = await requireGolideUser(returnTo);
  if (!isAdminUser(user)) redirect("/admin-only");
  return user;
}

export function chatGPTSignInPath(returnTo = "/"): string {
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeRelativePath(returnTo))}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeRelativePath(returnTo))}`;
}

export function safeRelativePath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, "https://golidee.com");
    if (url.origin !== "https://golidee.com") return "/";
    if ([SIGN_IN_PATH, SIGN_OUT_PATH, CALLBACK_PATH].includes(url.pathname)) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
