import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bot, ChartNoAxesCombined, CircleDot, Gauge, ShieldCheck } from "lucide-react";
import { Footer, Header } from "../../shared";

export const metadata:Metadata={title:"Market Systems — Coming Soon",description:"GOLIDE market intelligence and trading systems are in development."};

export default function Page(){return <main className="neo-site"><Header/><section className="coming-hero shell"><Link href="/#ecosystem" className="back-link"><ArrowLeft/> Ecosystem</Link><p className="neo-kicker"><CircleDot/> VENTURE FILE / 02</p><h1>Market systems<br/><span>are being built.</span></h1><p>Risk, execution and performance tools designed around discipline—not promises, signals or shortcuts.</p><div className="coming-modules"><article><ShieldCheck/><small>Module 01</small><strong>Risk control</strong><span>Coming soon</span></article><article><Gauge/><small>Module 02</small><strong>Performance review</strong><span>Coming soon</span></article><article><ChartNoAxesCombined/><small>Module 03</small><strong>Market intelligence</strong><span>Coming soon</span></article><article><Bot/><small>Module 04</small><strong>Automation lab</strong><span>Research phase</span></article></div><p className="risk-note">Trading involves substantial risk. GOLIDE will not promise returns or present experimental systems as guaranteed income.</p></section><Footer/></main>}
