import { NextResponse } from "next/server";
import { destroyGolideSession, safeRelativePath } from "../../chatgpt-auth";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => new FormData());
  const returnTo = safeRelativePath(typeof form.get("returnTo") === "string" ? String(form.get("returnTo")) : "/");
  await destroyGolideSession(request.url);
  return NextResponse.redirect(new URL(returnTo, request.url), 303);
}
