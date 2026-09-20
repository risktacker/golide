import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../chatgpt-auth";
import PartnersClient from "./partners-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Partner Engine  -  GOLIDE Marketplace",
  description: "Private GOLIDE partner outreach queue.",
  alternates: { canonical: "https://marketplace.golidee.com/partners" },
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

export default async function Page() {
  const user = await requireAdmin("/partners");
  if (user.email.trim().toLowerCase() !== "esiahkapinga@gmail.com") redirect("https://golidee.com/admin-only");
  return <PartnersClient />;
}
