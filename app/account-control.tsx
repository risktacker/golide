"use client";

import { useEffect, useState } from "react";

type AccountUser = { displayName: string; email: string; isAdmin: boolean };

export default function AccountControl() {
  const [user, setUser] = useState<AccountUser | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => { if (active) setUser(payload?.user ?? null); })
      .catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, []);

  if (user === undefined) return <span className="account-pending">Account</span>;
  if (!user) return <a href="/login?returnTo=%2F">Sign in</a>;

  const firstName = user.displayName.split(/\s+/)[0] || user.email;
  return <span className="account-control">
    <span className="account-identity">{user.isAdmin ? "Admin" : "Account"} · {firstName}</span>
    <form action="/auth/signout" method="post"><button className="auth-nav-button" type="submit">Sign out</button></form>
  </span>;
}
