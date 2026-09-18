import type { Metadata } from "next";
import { requireAdmin } from "../../chatgpt-auth";
import PartnersClient from "./partners-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Partner Engine — GOLIDE",
  description: "Private GOLIDE founding-partner outreach queue.",
  alternates: { canonical: "https://golidee.com/manage/partners" },
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

export default async function Page() {
  await requireAdmin("/manage/partners");
  return <PartnersClient />;
}
