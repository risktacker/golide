"use client";

import { useState } from "react";

export function MediaSlot({ src, alt, label }: { src: string; alt: string; label: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="timeline-media">
    {!failed
      ? <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      : <div className="media-pending"><span>IMAGE SLOT</span><strong>{label}</strong><small>Asset pending</small></div>}
  </div>;
}
