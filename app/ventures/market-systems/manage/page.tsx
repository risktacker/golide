import type { Metadata } from "next";
import ManagerClient from "./manager-client";

export const metadata: Metadata = {
  title: "Market Publisher — G$LIDE",
  description: "Private publishing console for the G$LIDE digital marketplace.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ManagerClient />;
}
