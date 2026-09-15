import { NextResponse } from "next/server";
import { getGolideUser, isAdminUser } from "../../../chatgpt-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getGolideUser();
  return NextResponse.json({
    user: user ? { displayName: user.displayName, email: user.email, isAdmin: isAdminUser(user) } : null,
  }, { headers: { "cache-control": "no-store" } });
}
