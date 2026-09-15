"use client";

import { useEffect, useState } from "react";

export default function OAuthCallbackPage() {
  const [message, setMessage] = useState("Finishing your GOLIDE sign-in…");

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

  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#050a0f",color:"#eef8fb",fontFamily:"Arial,sans-serif",padding:24}}>
    <div style={{width:"min(460px,100%)",padding:28,border:"1px solid rgba(83,231,255,.18)",borderRadius:20,background:"#09151d",textAlign:"center"}}>
      <img src="/brand/symbol.png?v=20260907-final" alt="" style={{width:48,height:48,objectFit:"contain"}}/>
      <h1 style={{fontSize:28,margin:"14px 0 8px"}}>GOLIDE</h1><p style={{color:"#91a7b1",margin:0}}>{message}</p>
    </div>
  </main>;
}
