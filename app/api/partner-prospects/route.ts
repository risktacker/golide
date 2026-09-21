import { NextResponse } from "next/server";

/**
 * Legacy endpoint retained only so stale admin tabs fail clearly.
 * The product-aware Partner Engine now owns prospect, relationship,
 * opportunity, coverage and search state at /api/partner-engine.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Partner prospects moved to the multi-product Partner Engine.",
      endpoint: "/api/partner-engine",
    },
    { status: 410 },
  );
}
