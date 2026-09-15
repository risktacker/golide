import type { Metadata } from "next";
import { requireAdmin } from "../../../chatgpt-auth";
import ManagerClient from "./manager-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Market Publisher — G$LIDE",
  description: "Private publishing console for the G$LIDE digital marketplace.",
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

export default async function Page() {
  await requireAdmin("/manage");
  return <ManagerClient/>;
}
