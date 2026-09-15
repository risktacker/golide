import Link from "next/link";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser, isAdminUser } from "./chatgpt-auth";

export default async function AccountControl() {
  const user = await getChatGPTUser();

  if (!user) {
    return <Link href={chatGPTSignInPath("/")}>Sign in</Link>;
  }

  const display = (user.fullName || user.email).split(/[\s@]/)[0] || "Account";

  return <>
    <span>{isAdminUser(user) ? `Admin · ${display}` : display}</span>
    <Link href={chatGPTSignOutPath("/")}>Sign out</Link>
  </>;
}
