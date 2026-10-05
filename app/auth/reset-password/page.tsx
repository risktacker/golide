"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import styles from "../../login/login.module.css";
import { BrandLockup } from "../../brand-mark";

// Landing page for the Supabase password-recovery email. Supabase puts the
// one-time recovery token in the URL fragment (#access_token=…&type=recovery),
// which never reaches the server logs.
export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("Checking your reset link…");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // The URL fragment only exists in the browser, so it has to be read after
  // mount; setting state here is the intended one-time sync.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const error = hash.get("error_description") || query.get("error_description");
    const accessToken = hash.get("access_token") || "";
    // Remove the token from the address bar so it is not copied or bookmarked.
    window.history.replaceState(null, "", window.location.pathname);
    if (error) { setMessage(error.replace(/\+/g, " ")); return; }
    if (!accessToken || (hash.get("type") && hash.get("type") !== "recovery")) {
      setMessage("This reset link is invalid or has already been used. Request a new one from the sign-in page.");
      return;
    }
    setToken(accessToken); setReady(true); setMessage("");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (password !== String(form.get("confirm") || "")) { setMessage("The two passwords do not match."); return; }
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/auth/password-update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accessToken: token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update your password.");
      setDone(true); setReady(false);
      setMessage(data.signedIn ? "Password updated. You are signed in." : "Password updated. You can now sign in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update your password.");
    } finally { setLoading(false); }
  }

  return <main className={styles.page}>
    <section className={styles.card}>
      <a className={styles.brand} href="https://golidee.com/" aria-label="GOLIDE home"><BrandLockup/></a>
      <p className={styles.eyebrow}>GOLIDE ACCOUNT</p>
      <h1>Set a new password.</h1>
      <p className={styles.lead}>Choose a new password for your GOLIDE account.</p>
      {ready && <form onSubmit={submit}>
        <label>New password<input name="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" aria-label="New password" minLength={6} required/></label>
        <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" placeholder="Type it again" aria-label="Confirm new password" minLength={6} required/></label>
        <button className={styles.submit} type="submit" disabled={loading}>{loading ? "Saving…" : "Save new password"}</button>
      </form>}
      {done && <Link className={styles.continueButton} href="/">Continue to GOLIDE</Link>}
      {!ready && !done && <Link className={styles.continueButton} href="/login">Back to sign in</Link>}
      {message && <p className={styles.message}>{message}</p>}
    </section>
  </main>;
}
