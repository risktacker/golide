import type { Metadata } from "next";
import { getGolideUser, safeRelativePath } from "../chatgpt-auth";
import LoginClient from "./login-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in  -  GOLIDE",
  description: "Sign in to GOLIDE to keep your marketplace and toolkit data connected to your account.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ returnTo?: string | string[] }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const rawReturn = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const returnTo = safeRelativePath(rawReturn || "/");
  const user = await getGolideUser();
  return <LoginClient returnTo={returnTo} alreadySignedIn={Boolean(user)}/>;
}
