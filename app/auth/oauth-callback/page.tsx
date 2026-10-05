"use client";

import { useEffect, useState } from "react";
import GolideLoader from "../../golide-loader";

export default function OAuthCallbackPage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function complete() {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error_description") || params.get("error");
      const code = params.get("code");
      if (error) { setMessage(error); return; }
      if (!code) { setMessage("The sign-in response did not include an authorization code. Please return and try again."); return; }
      try {
        const response = await fetch("/api/auth/oauth/complete", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not finish sign-in.");
        window.location.replace(data.returnTo || "/");
      } catch (err) { setMessage(err instanceof Error ? err.message : "Could not finish sign-in."); }
    }
    void complete();
  }, []);

  if (!message) return <GolideLoader label="Finishing your GOLIDE sign-in"/>;
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"var(--ink)",padding:24}}>
    <div style={{width:"min(460px,100%)",padding:28,border:"1px solid var(--line)",borderRadius:20,background:"var(--soft)",textAlign:"center"}}>
      <h1 style={{fontSize:25,fontWeight:500,margin:"0 0 8px"}}>Sign-in didn&apos;t finish</h1>
      <p style={{color:"var(--muted)",margin:"0 0 18px"}}>{message}</p>
      <a className="neo-button solid" href="/login">Try again</a>
    </div>
  </main>;
}
