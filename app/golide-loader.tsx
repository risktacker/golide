"use client";

import { useEffect, useRef, useState } from "react";

// Points of light gather into the GOLIDE mark (a G of points, the last one
// gold), the wordmark fades in, then it dissolves and gathers again: the same
// motion language as the GOLIDE videos. Static pulsing word for people who
// prefer reduced motion.
const MARK: { x: number; y: number; r: number; gold: boolean; alpha: number }[] = [
  ...Array.from({ length: 11 }, (_, i) => {
    const a = ((-40 + i * 29) * Math.PI) / 180;
    return { x: 32 + 22 * Math.cos(a), y: 32 + 22 * Math.sin(a), r: 1.6 + i * 0.22, gold: false, alpha: 1 };
  }),
  { x: 36, y: 32, r: 2.2, gold: false, alpha: 0.55 },
  { x: 44, y: 32, r: 3.6, gold: true, alpha: 1 },
];

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
    const color = (name: string, fallback: number[]) => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(v);
      return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : fallback;
    };
    const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, a).toFixed(3)})`;
    type P = { tx: number; ty: number; sx: number; sy: number; bend: number; delay: number; tw: number; size: number; gold: boolean };
    let parts: P[] = [], w = 0, h = 0, unit = 1, ox = 0, oy = 0, wordY = 0, fontSize = 16;
    let ink = [236, 237, 239], gold = [233, 196, 106];

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      if (w < 2 || h < 2) { parts = []; return; } // hidden: nothing to draw yet
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const size = Math.max(72, Math.min(w, h) * .22);
      unit = size / 64; ox = w / 2 - size / 2; oy = h / 2 - size / 2 - size * .22;
      wordY = oy + size + Math.max(22, size * .32); fontSize = Math.max(14, size * .17);
      ink = color("--paper", [236, 237, 239]); gold = color("--gold", [233, 196, 106]);
      const reach = Math.max(w, h) * .6;
      seed = 11; parts = [];
      for (const d of MARK) {
        const k = Math.max(4, Math.round(d.r * d.r * 2.2));
        for (let i = 0; i < k; i++) {
          const a = rand() * Math.PI * 2, dist = reach * (.35 + rand() * .65), ra = rand() * Math.PI * 2, rr = Math.sqrt(rand()) * d.r * .75;
          parts.push({ tx: ox + (d.x + Math.cos(ra) * rr) * unit, ty: oy + (d.y + Math.sin(ra) * rr) * unit,
            sx: w / 2 + Math.cos(a) * dist, sy: h / 2 + Math.sin(a) * dist,
            bend: (rand() - .5) * .5, delay: d.gold ? .35 : rand() * .3, tw: rand() * 6.283, size: .7 + rand() * .8, gold: d.gold });
        }
      }
    };

    const drawMark = (alpha: number) => {
      for (const d of MARK) {
        ctx.fillStyle = rgba(d.gold ? gold : ink, alpha * d.alpha);
        ctx.beginPath(); ctx.arc(ox + d.x * unit, oy + d.y * unit, d.r * unit, 0, 6.2832); ctx.fill();
      }
      ctx.fillStyle = rgba(gold, alpha * .18);
      ctx.beginPath(); ctx.arc(ox + 44 * unit, oy + 32 * unit, 3.6 * unit * 2.6, 0, 6.2832); ctx.fill();
    };
    const drawWord = (alpha: number) => {
      if (alpha <= 0) return;
      const word = "GOLIDE", sp = fontSize * .42;
      ctx.font = `500 ${fontSize}px Geist, ui-sans-serif, system-ui, sans-serif`;
      ctx.textBaseline = "middle";
      let total = 0;
      for (let i = 0; i < word.length; i++) total += ctx.measureText(word[i]).width + (i < word.length - 1 ? sp : 0);
      let x = (w - total) / 2;
      ctx.fillStyle = rgba(ink, alpha);
      for (let i = 0; i < word.length; i++) { ctx.fillText(word[i], x, wordY); x += ctx.measureText(word[i]).width + sp; }
    };

    const GATHER = 1.4, SETTLE = .35, HOLD = 1.0, OUT = .8, CYCLE = GATHER + SETTLE + HOLD + OUT;
    const start = performance.now();
    const frame = (now: number) => {
      if (stopped) return;
      const p = ((now - start) / 1000) % CYCLE;
      ctx.clearRect(0, 0, w, h);
      let partAlpha = 1, markAlpha = 0, wordAlpha = 0, burst = 0;
      if (p >= GATHER && p < GATHER + SETTLE) { const s = ease((p - GATHER) / SETTLE); markAlpha = s; partAlpha = 1 - s; wordAlpha = s * .6; }
      else if (p >= GATHER + SETTLE && p < GATHER + SETTLE + HOLD) { markAlpha = 1; partAlpha = 0; wordAlpha = Math.min(1, .6 + (p - GATHER - SETTLE) * 1.5); }
      else if (p >= GATHER + SETTLE + HOLD) { burst = ease((p - GATHER - SETTLE - HOLD) / OUT); markAlpha = 1 - burst * 2; partAlpha = 1 - burst; wordAlpha = 1 - burst * 1.6; }
      if (partAlpha > .01) for (const q of parts) {
        let x: number, y: number, a: number;
        if (p < GATHER + SETTLE) {
          const k = ease((p / GATHER - q.delay) / (1 - q.delay));
          const dx = q.tx - q.sx, dy = q.ty - q.sy, arc = Math.sin(Math.PI * k) * q.bend;
          x = q.sx + dx * k - dy * arc; y = q.sy + dy * k + dx * arc; a = (.25 + .75 * k) * partAlpha;
        } else {
          const vx = q.tx - w / 2, vy = q.ty - h / 2, len = Math.hypot(vx, vy) || 1;
          x = q.tx + vx / len * burst * 70 + Math.cos(q.tw) * burst * 26; y = q.ty + vy / len * burst * 70 + Math.sin(q.tw) * burst * 26; a = partAlpha;
        }
        ctx.fillStyle = rgba(gold, a * .14);
        ctx.beginPath(); ctx.arc(x, y, q.size * 3.2, 0, 6.2832); ctx.fill();
        ctx.fillStyle = rgba(q.gold ? gold : ink, a);
        ctx.beginPath(); ctx.arc(x, y, q.size, 0, 6.2832); ctx.fill();
      }
      if (markAlpha > .01) drawMark(markAlpha);
      drawWord(wordAlpha);
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

// First visit in a browser session: the particle mark plays while the page
// loads (at least one full gather), then fades. A head script sets
// data-splash before paint so returning pages never flash it.
export function EntrySplash() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.splash !== "1") { const t = setTimeout(() => setShow(false), 0); return () => clearTimeout(t); }
    const started = performance.now();
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      const wait = Math.max(0, 2500 - (performance.now() - started));
      setTimeout(() => {
        setFading(true);
        setTimeout(() => { delete root.dataset.splash; try { sessionStorage.setItem("golide-splash", "1"); } catch {} setShow(false); }, 500);
      }, wait);
    };
    if (document.readyState === "complete") finish(); else addEventListener("load", finish, { once: true });
    const safety = setTimeout(finish, 6000);
    return () => { clearTimeout(safety); removeEventListener("load", finish); };
  }, []);
  if (!show) return null;
  return <div className={"entry-splash" + (fading ? " is-done" : "")}><GolideLoader label="Opening GOLIDE"/></div>;
}
