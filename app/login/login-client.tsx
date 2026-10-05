"use client";

import { FormEvent, useState } from "react";
import styles from "./login.module.css";
import GolideLoader from "../golide-loader";

type Props = { returnTo: string; alreadySignedIn: boolean };
type Mode = "signin" | "signup" | "forgot";

const HEADINGS: Record<Mode, string> = {
  signin: "Welcome back.",
  signup: "Create your account.",
  forgot: "Reset your password.",
};

export default function LoginClient({ returnTo, alreadySignedIn }: Props) {
  const [mode, setMode] = useState<Mode>("signin");
  const [message, setMessage] = useState(alreadySignedIn ? "You are already signed in." : "");
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);

  function switchMode(next: Mode) { setMode(next); setMessage(""); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true); setMessage("");
    try {
      if (mode === "forgot") {
        const response = await fetch("/api/auth/password-reset", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: form.get("email") }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not send the reset email.");
        setMessage(data.message || "If an account exists for that email, a reset link is on its way.");
        return;
      }
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, email: form.get("email"), password: form.get("password"), returnTo }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not sign in.");
      if (data.confirmationRequired) { setMessage(data.message || "Check your email to confirm your account."); return; }
      setLeaving(true);
      window.location.replace(data.returnTo || returnTo || "/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    } finally { setLoading(false); }
  }

  const googleUrl = `/api/auth/oauth/google?returnTo=${encodeURIComponent(returnTo)}`;
  const submitLabel = loading ? "Working…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link";

  return <main className={styles.page}>
    {(leaving || (loading && mode !== "forgot")) && <GolideLoader label={mode === "signup" ? "Creating your account" : "Signing you in"}/>}
    <section className={styles.card}>
      <a className={styles.brand} href="https://golidee.com/" aria-label="GOLIDE home"><img src="/brand/wordmark.png?v=20260907-final" alt="GOLIDE"/></a>
      <p className={styles.eyebrow}>GOLIDE ACCOUNT</p>
      <h1>{HEADINGS[mode]}</h1>
      <p className={styles.lead}>{mode === "forgot"
        ? "Enter the email you use for GOLIDE and we will send you a link to set a new password."
        : "Sign in once, then keep your toolkit progress and account state when you return."}</p>

      {alreadySignedIn ? <a className={styles.continueButton} href={returnTo}>Continue to GOLIDE</a> : <>
        {mode !== "forgot" && <>
          <a className={styles.googleButton} href={googleUrl} onClick={() => setLeaving(true)}><img className={styles.googleLogo} src="/brand/google-g.svg" alt="" aria-hidden="true"/> Continue with Google</a>
          <div className={styles.divider}><span/>or<span/></div>
        </>}
        <form onSubmit={submit} key={mode}>
          <label>Email<input name="email" type="email" autoComplete="email" inputMode="email" placeholder="Enter your email" aria-label="Email address" required/></label>
          {mode !== "forgot" && <label>Password<input name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder={mode === "signin" ? "Enter your password" : "Create a password (6+ characters)"} aria-label="Password" minLength={6} required/></label>}
          <button className={styles.submit} type="submit" disabled={loading}>{submitLabel}</button>
        </form>
        {mode === "signin" && <button className={styles.switch} type="button" onClick={() => switchMode("forgot")}>Forgot your password?</button>}
        {mode === "forgot"
          ? <button className={styles.switch} type="button" onClick={() => switchMode("signin")}>Back to sign in</button>
          : <button className={styles.switch} type="button" onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "New to GOLIDE? Create an account" : "Already have an account? Sign in"}</button>}
      </>}
      {message && <p className={styles.message}>{message}</p>}
      <p className={styles.fine}>Your sign-in is handled by the GOLIDE Supabase authentication project. You return to the page you came from after login.</p>
    </section>
  </main>;
}
