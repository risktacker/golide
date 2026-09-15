"use client";

import { FormEvent, useState } from "react";
import styles from "./login.module.css";

type Props = { returnTo: string; alreadySignedIn: boolean };

export default function LoginClient({ returnTo, alreadySignedIn }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState(alreadySignedIn ? "You are already signed in." : "");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, email: form.get("email"), password: form.get("password"), returnTo }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not sign in.");
      if (data.confirmationRequired) { setMessage(data.message || "Check your email to confirm your account."); return; }
      window.location.replace(data.returnTo || returnTo || "/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    } finally { setLoading(false); }
  }

  const googleUrl = `/api/auth/oauth/google?returnTo=${encodeURIComponent(returnTo)}`;

  return <main className={styles.page}>
    <section className={styles.card}>
      <a className={styles.brand} href="https://golidee.com/" aria-label="GOLIDE home"><img src="/brand/wordmark.png?v=20260907-final" alt="GOLIDE"/></a>
      <p className={styles.eyebrow}>GOLIDE ACCOUNT</p>
      <h1>{mode === "signin" ? "Welcome back." : "Create your account."}</h1>
      <p className={styles.lead}>Sign in once, then keep your toolkit progress and account state when you return.</p>

      {alreadySignedIn ? <a className={styles.continueButton} href={returnTo}>Continue to GOLIDE</a> : <>
        <a className={styles.googleButton} href={googleUrl}><img className={styles.googleLogo} src="/brand/google-g.svg" alt="" aria-hidden="true"/> Continue with Google</a>
        <div className={styles.divider}><span/>or<span/></div>
        <form onSubmit={submit}>
          <label>Email<input name="email" type="email" autoComplete="email" inputMode="email" placeholder="Enter your email" aria-label="Email address" required/></label>
          <label>Password<input name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder={mode === "signin" ? "Enter your password" : "Create a password (6+ characters)"} aria-label="Password" minLength={6} required/></label>
          <button className={styles.submit} type="submit" disabled={loading}>{loading ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        <button className={styles.switch} type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}>{mode === "signin" ? "New to GOLIDE? Create an account" : "Already have an account? Sign in"}</button>
      </>}
      {message && <p className={styles.message}>{message}</p>}
      <p className={styles.fine}>Your sign-in is handled by the GOLIDE Supabase authentication project. You return to the page you came from after login.</p>
    </section>
  </main>;
}
