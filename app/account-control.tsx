"use client";

import { useEffect, useMemo, useState } from "react";

type AccountUser = { displayName: string; email: string; isAdmin: boolean };

function authPath(action: "signin" | "signout", returnTo: string) {
  const base = action === "signin" ? "/signin-with-chatgpt" : "/signout-with-chatgpt";
  return `${base}?return_to=${encodeURIComponent(returnTo || "/")}`;
}

export default function AccountControl() {
  const [user, setUser] = useState<AccountUser | null | undefined>(undefined);
  const [returnTo, setReturnTo] = useState("/");

  useEffect(() => {
    setReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}` || "/");
    let active = true;
    fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => { if (active) setUser(payload?.user ?? null); })
      .catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, []);

  const signIn = useMemo(() => authPath("signin", returnTo), [returnTo]);
  const signOut = useMemo(() => authPath("signout", returnTo), [returnTo]);

  if (user === undefined) return <span className="account-pending">Account</span>;
  if (!user) return <a href={signIn}>Sign in</a>;

  const firstName = user.displayName.split(/\s+/)[0] || user.email;
  return <span className="account-control">
    <span className="account-identity">{user.isAdmin ? "Admin" : "Account"} · {firstName}</span>
    <a className="auth-nav-button" href={signOut}>Sign out</a>
  </span>;
}
