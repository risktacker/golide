"use client";

import { useEffect, useState } from "react";

export default function AdminStudioLink({ className, children = "Studio" }: { className?: string; children?: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => { if (active) setIsAdmin(Boolean(payload?.user?.isAdmin)); })
      .catch(() => { if (active) setIsAdmin(false); });
    return () => { active = false; };
  }, []);

  if (!isAdmin) return null;
  return <a className={className} href="https://studio.golidee.com/">{children}</a>;
}
