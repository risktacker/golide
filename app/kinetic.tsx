"use client";

import { Activity, ArrowDownRight, BarChart3, Bot, Code2, Dna, Gauge, Radar, Sparkles } from "lucide-react";

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
