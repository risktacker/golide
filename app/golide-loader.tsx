"use client";

import { useEffect, useRef } from "react";

// Gold points of light gather into GOLIDE, hold, dissolve, gather again: the
// same motion language as the GOLIDE videos. Static pulsing word for people
// who prefer reduced motion.
export default function GolideLoader({ label = "Loading GOLIDE" }: { label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let stopped = false;
    const ease = (x: number) => { x = Math.max(0, Math.min(1, x)); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    let seed = 11;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const gold = (getComputedStyle(document.documentElement).getPropertyValue("--gold").trim() || "#d6ad54");
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(gold);
    const rgb = m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [214, 173, 84];
    type P = { tx: number; ty: number; sx: number; sy: number; bend: number; delay: number; tw: number; size: number; hot: boolean };
    let parts: P[] = [], w = 0, h = 0;

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const off = document.createElement("canvas");
      off.width = Math.ceil(w); off.height = Math.ceil(h);
      const c = off.getContext("2d");
      if (!c) return;
      const size = Math.max(24, Math.min(w * .11, 84));
      c.font = `500 ${size}px Geist, ui-sans-serif, system-ui, sans-serif`;
      c.textBaseline = "middle"; c.fillStyle = "#fff";
      const word = "GOLIDE", spacing = size * .42;
      let total = 0;
      for (let i = 0; i < word.length; i++) total += c.measureText(word[i]).width + (i < word.length - 1 ? spacing : 0);
      let x = (w - total) / 2;
      for (let i = 0; i < word.length; i++) { c.fillText(word[i], x, h / 2); x += c.measureText(word[i]).width + spacing; }
      const data = c.getImageData(0, 0, off.width, off.height).data, pts: [number, number][] = [];
      const step = Math.max(1, Math.round(size / 22));
      for (let yy = 0; yy < off.height; yy += step) for (let xx = 0; xx < off.width; xx += step)
        if (data[(yy * off.width + xx) * 4 + 3] > 140) pts.push([xx, yy]);
      const count = Math.round(Math.min(320, Math.max(150, w * .32)));
      const reach = Math.max(w, h) * .62;
      seed = 11;
      parts = Array.from({ length: Math.min(count, pts.length * 4) }, (_, i) => {
        const t = pts[Math.floor(rand() * pts.length)], a = rand() * Math.PI * 2, d = reach * (.35 + rand() * .65);
        return { tx: t[0], ty: t[1], sx: w / 2 + Math.cos(a) * d, sy: h / 2 + Math.sin(a) * d,
          bend: (rand() - .5) * .5, delay: rand() * .35, tw: rand() * 6.28, size: .8 + rand() * .9, hot: i % 9 === 0 };
      });
    };

    const GATHER = 1.5, HOLD = .9, OUT = .9, CYCLE = GATHER + HOLD + OUT;
    const start = performance.now();
    const frame = (now: number) => {
      if (stopped) return;
      const t = (now - start) / 1000, p = t % CYCLE;
      ctx.clearRect(0, 0, w, h);
      for (const q of parts) {
        let x: number, y: number, alpha: number;
        if (p < GATHER) {
          const k = ease((p / GATHER - q.delay * .4) / (1 - q.delay * .4));
          const dx = q.tx - q.sx, dy = q.ty - q.sy, arc = Math.sin(Math.PI * k) * q.bend;
          x = q.sx + dx * k - dy * arc; y = q.sy + dy * k + dx * arc; alpha = .25 + .75 * k;
        } else if (p < GATHER + HOLD) {
          x = q.tx; y = q.ty; alpha = .78 + .22 * Math.sin(t * 3 + q.tw);
        } else {
          const o = ease((p - GATHER - HOLD) / OUT), ox = q.tx - w / 2, oy = q.ty - h / 2, len = Math.hypot(ox, oy) || 1;
          x = q.tx + ox / len * o * 60 + Math.cos(q.tw) * o * 30; y = q.ty + oy / len * o * 60 + Math.sin(q.tw) * o * 30; alpha = 1 - o;
        }
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(alpha * .16).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, q.size * 3.4, 0, 6.2832); ctx.fill();
        ctx.fillStyle = q.hot ? `rgba(255,248,230,${alpha.toFixed(3)})` : `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, q.size, 0, 6.2832); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    const go = () => { build(); raf = requestAnimationFrame(frame); };
    (document.fonts?.load("500 40px Geist") ?? Promise.resolve()).then(go, go);
    addEventListener("resize", build);
    return () => { stopped = true; cancelAnimationFrame(raf); removeEventListener("resize", build); };
  }, []);

  return <div className="golide-loader" role="status" aria-live="polite">
    <canvas ref={canvasRef} className="golide-loader-canvas" aria-hidden="true"/>
    <span className="golide-loader-word" aria-hidden="true">GOLIDE</span>
    <span className="sr-only">{label}</span>
  </div>;
}
