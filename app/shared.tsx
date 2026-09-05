import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";

export function Logo() {
  return <Link className="logo brand-logo" href="/" aria-label="G$LIDE home">
    <img className="brand-wordmark" src="/brand/wordmark.png?v=20260905" alt="G$LIDE"/>
    <img className="brand-symbol" src="/brand/symbol.png?v=20260905" alt="" aria-hidden="true"/>
  </Link>;
}

export function Header() { return <header className="site-header"><div className="shell nav-wrap"><Logo/><nav className="desktop-nav" aria-label="Primary navigation"><Link href="/#ecosystem">Ventures</Link><Link href="/research">Research</Link><Link href="/founder">Founder</Link><Link href="mailto:esiahkapinga3@gmail.com">Contact</Link></nav><Link className="nav-cta" href="/#ecosystem">Explore G$LIDE <ArrowUpRight size={15}/></Link><details className="mobile-menu"><summary aria-label="Open menu"><Menu size={22}/></summary><nav><Link href="/#ecosystem">Ventures</Link><Link href="/research">Research</Link><Link href="/founder">Founder</Link><Link href="mailto:esiahkapinga3@gmail.com">Contact</Link></nav></details></div></header>; }

export function Footer() { return <footer><div className="shell footer-top"><div><Logo/><p>A founder-led ecosystem for software, markets and research.</p></div><div className="footer-links"><div><strong>Explore</strong><Link href="/#ecosystem">Ventures</Link><Link href="/research">Research</Link><Link href="/founder">Founder</Link></div><div><strong>Connect</strong><a href="https://github.com/risktacker/golide" target="_blank" rel="noreferrer">GitHub</a><a href="mailto:esiahkapinga3@gmail.com">Email</a></div></div></div><div className="shell footer-bottom"><span>© 2026 G$LIDE. Built from Lusaka.</span><span>Knowledge → Systems → Value</span></div></footer>; }
