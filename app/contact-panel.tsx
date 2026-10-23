"use client";

import { Check, Copy, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./contact-panel.module.css";

// 2026-10-24: "Email hello@golidee.com" links did nothing on computers without a mail
// app. Every such link on the site now opens this panel instead; the plain mailto link
// stays underneath for visitors without JavaScript. Messages land in the Studio Inbox.
const ADDRESS = "hello@golidee.com";
const ENDPOINT = "https://studio.golidee.com/api/public/contact";

type State = "idle" | "sending" | "sent" | "error";

export default function ContactPanel() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("Hello GOLIDE");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const openedAt = useRef(0);
  const firstField = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const show = useCallback((subject: string) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setTopic(subject || "Hello GOLIDE");
    setState("idle");
    setError("");
    openedAt.current = Date.now();
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as HTMLElement | null)?.closest?.("a[href^='mailto:']") as HTMLAnchorElement | null;
      if (!link || link.dataset.direct || !link.href.toLowerCase().startsWith("mailto:" + ADDRESS)) return;
      event.preventDefault();
      const subject = new URL(link.href.replace(/^mailto:[^?]*/i, "https://x/")).searchParams.get("subject") || "";
      show(subject);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => firstField.current?.focus(), 60);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
  }, [open, close]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState("sending");
    setError("");
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"), email: form.get("email"), topic: form.get("topic"),
          message: form.get("message"), website: form.get("website"),
          elapsed_ms: Date.now() - openedAt.current,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Your message could not be sent.");
      setState("sent");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Your message could not be sent.");
    }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(ADDRESS); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch {}
  }

  return <div className={styles.root} data-open={open ? "1" : "0"} aria-hidden={!open}>
    <div className={styles.scrim} onClick={close}/>
    <aside className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="contact-title">
      <header className={styles.head}>
        <div>
          <h2 id="contact-title">Write to GOLIDE</h2>
          <p>We read every message and reply from {ADDRESS}.</p>
        </div>
        <button type="button" className={styles.close} onClick={close} aria-label="Close"><X size={18}/></button>
      </header>

      {state === "sent" ? <div className={styles.done}>
        <span className={styles.tick}><Check size={22}/></span>
        <h3>Message sent</h3>
        <p>Thanks. We will reply to your email, usually within a day.</p>
        <button type="button" className={styles.primary} onClick={close}>Close</button>
      </div> : <form className={styles.form} onSubmit={submit}>
        <label>Your name<input ref={firstField} name="name" required maxLength={100} autoComplete="name"/></label>
        <label>Your email<input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="so we can reply"/></label>
        <label>What it is about<input name="topic" maxLength={120} defaultValue={topic} key={topic}/></label>
        <label>Message<textarea name="message" required minLength={10} maxLength={4000} rows={7}
          placeholder="Tell us what you are trying to get done."/></label>
        <input className={styles.trap} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
        {state === "error" && <p className={styles.error} role="alert">{error}</p>}
        <button type="submit" className={styles.primary} disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : <>Send message <Send size={16} aria-hidden="true"/></>}
        </button>
      </form>}

      <footer className={styles.foot}>
        <span>Prefer your own email?</span>
        <a href={"mailto:" + ADDRESS} data-direct="1">{ADDRESS}</a>
        <button type="button" onClick={copy} className={styles.copy} aria-label="Copy the email address">
          {copied ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy</>}
        </button>
      </footer>
    </aside>
  </div>;
}
