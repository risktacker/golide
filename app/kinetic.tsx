"use client";

import { useEffect, useRef } from "react";
import { Activity, ArrowDownRight, BarChart3, Bot, Code2, Dna, Gauge, Radar, Sparkles } from "lucide-react";

export function HeroPortrait() {
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = visualRef.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const travelled = Math.max(0, 78 - rect.top);
        const distance = Math.max(280, rect.height * 0.5);
        const progress = Math.min(1, travelled / distance);
        const ribbonProgress = Math.min(1, Math.max(0, (progress - 0.58) / 0.42));
        const maximumShift = Math.min(window.innerWidth * 0.18, 300);
        node.style.setProperty("--portrait-shift", `${(1 - progress) * maximumShift}px`);
        node.style.setProperty("--ribbon-opacity", `${ribbonProgress * 0.78}`);
        node.style.setProperty("--ribbon-scale", `${0.12 + ribbonProgress * 0.88}`);
        node.style.setProperty("--ribbon-shift", `${(1 - ribbonProgress) * 84}px`);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div ref={visualRef} className="hero-visual" aria-hidden="true">
    <div className="hero-ribbons">
      <span className="hero-ribbon ribbon-a" />
      <span className="hero-ribbon ribbon-b" />
      <span className="hero-ribbon ribbon-c" />
      <span className="hero-ribbon ribbon-d" />
    </div>
    <div className="hero-real-portrait">
      <img src="/founder/hero-white-shirt-cutout.webp?v=20260908-scroll" alt="" />
    </div>
  </div>;
}

export function KineticHero() {
  return <div className="kinetic-stage" aria-label="Animated GOLIDE technology ecosystem">
    <div className="kinetic-glow" />
    <div className="scan-grid" />
    <div className="signal-card signal-a"><Activity/><span>Systems online</span><strong>03</strong></div>
    <div className="signal-card signal-b"><Radar/><span>Research nodes</span><strong>05</strong></div>
    <div className="signal-card signal-c"><Gauge/><span>Build velocity</span><strong>↑</strong></div>
    <div className="tech-orbit orbit-a"><span><Bot/></span></div>
    <div className="tech-orbit orbit-b"><span><Dna/></span></div>
    <div className="tech-orbit orbit-c"><span><BarChart3/></span></div>
    <div className="golide-core"><small>THE GOLIDE<br/>ECOSYSTEM</small><strong>G</strong><i>01—∞</i></div>
    <div className="data-ticker"><span>BUILD</span><i>◆</i><span>RESEARCH</span><i>◆</i><span>TRADE</span><i>◆</i><span>CONNECT</span></div>
  </div>;
}

export function Marquee({ items }: { items: string[] }) {
  const content = [...items, ...items];
  return <div className="marquee" aria-hidden="true"><div>{content.map((item,i)=><span key={`${item}-${i}`}>{item}<i>●</i></span>)}</div></div>;
}

export function FloatingBadge(){return <div className="floating-badge"><Sparkles/><span>Built from<br/><strong>Zambia</strong></span><ArrowDownRight/></div>}

export function CodePulse(){return <div className="code-pulse"><Code2/><span>Product layer</span><div>{[1,2,3,4,5].map(n=><i key={n}/>)}</div></div>}
