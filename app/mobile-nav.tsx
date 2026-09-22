"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AccountControl from "./account-control";
import AdminStudioLink from "./admin-studio-link";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return <div className={"mobile-menu" + (open ? " is-open" : "")} ref={rootRef}>
    <button
      className="mobile-menu-toggle"
      type="button"
      aria-expanded={open}
      aria-controls="mobile-primary-navigation"
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={() => setOpen((value) => !value)}
    >
      <span className="mobile-menu-toggle-mark" aria-hidden="true"></span>
      {open ? <X size={20}/> : <Menu size={20}/>}
    </button>

    {open && <>
      <button className="mobile-menu-backdrop" type="button" aria-label="Close navigation" onClick={close}/>
      <nav
        id="mobile-primary-navigation"
        className="mobile-menu-panel"
        aria-label="Mobile navigation"
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (target.closest("a") || target.closest(".auth-nav-button")) close();
        }}
      >
        <div className="mobile-menu-panel-head">
          <span>Navigation</span>
          <small>GOLIDE</small>
        </div>

        <div className="mobile-menu-section">
          <span className="mobile-menu-label">Explore</span>
          <a href="https://golidee.com/">Ventures</a>
          <a href="https://golidee.com/research">Research</a>
          <a href="https://golidee.com/founder">Founder</a>
        </div>

        <div className="mobile-menu-section">
          <span className="mobile-menu-label">Systems</span>
          <a className="mobile-marketplace-link" href="https://marketplace.golidee.com/">
            Marketplace <ArrowUpRight size={15}/>
          </a>
          <AdminStudioLink className="mobile-studio-link">Studio</AdminStudioLink>
        </div>

        <div className="mobile-menu-section mobile-account-section">
          <span className="mobile-menu-label">Account</span>
          <AccountControl/>
        </div>
      </nav>
    </>}
  </div>;
}
