import type { Metadata } from "next";
import { requireAdmin } from "../../../golide-auth";
import PartnersClient from "./partners-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Partner Engine  -  GOLIDE Marketplace",
  description: "Private GOLIDE partner finder.",
  alternates: { canonical: "https://marketplace.golidee.com/partners" },
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

export default async function Page() {
  await requireAdmin("/partners");
  return <PartnersClient />;
}
