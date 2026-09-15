import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import AccountControl from "./account-control";

export function Logo() {
  return <Link className="logo brand-logo" href="https://golidee.com/" aria-label="G$LIDE home">
    <img className="brand-wordmark" src="/brand/wordmark.png?v=20260907-final" alt="G$LIDE"/>
    <img className="brand-symbol" src="/brand/symbol.png?v=20260907-final" alt="" aria-hidden="true"/>
  </Link>;
}

export function Header() {
  return <header className="site-header"><div className="shell nav-wrap"><Logo/><nav className="desktop-nav" aria-label="Primary navigation"><Link href="https://golidee.com/">Ventures</Link><Link href="https://golidee.com/research">Research</Link><Link href="https://golidee.com/founder">Founder</Link><Link href="https://golidee.com/studio">Studio</Link><AccountControl/></nav><Link className="nav-cta" href="https://marketplace.golidee.com/">Marketplace <ArrowUpRight size={15}/></Link><details className="mobile-menu"><summary aria-label="Open menu"><Menu size={22}/></summary><nav><Link href="https://golidee.com/">Ventures</Link><Link href="https://golidee.com/research">Research</Link><Link href="https://golidee.com/founder">Founder</Link><Link href="https://golidee.com/studio">Studio</Link><AccountControl/></nav></details></div></header>;
}

export function Footer() { return <footer><div className="shell footer-top"><div><Logo/><p>A founder-led ecosystem for software, markets and research.</p></div><div className="footer-links"><div><strong>Explore</strong><Link href="https://marketplace.golidee.com/">Marketplace</Link><Link href="https://golidee.com/research">Research</Link><Link href="https://golidee.com/founder">Founder</Link></div><div><strong>Systems</strong><Link href="https://golidee.com/content-engine">Content Engine</Link><Link href="https://golidee.com/privacy">Privacy</Link><Link href="https://golidee.com/terms">Terms</Link></div><div><strong>Connect</strong><a href="https://github.com/risktacker/golide" target="_blank" rel="noreferrer">GitHub</a><a href="mailto:esiahsbusiness@gmail.com">Email</a></div></div></div><div className="shell footer-bottom"><span>© 2026 G$LIDE. Built from Lusaka.</span><span>Knowledge → Systems → Value</span></div></footer>; }
