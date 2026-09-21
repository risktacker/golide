import { ArrowUpRight, Menu } from "lucide-react";
import type { ReactNode } from "react";
import AccountControl from "./account-control";
import AdminStudioLink from "./admin-studio-link";

export function Logo() {
  return <a className="logo brand-logo" href="https://golidee.com/" aria-label="G$LIDE home">
    <img className="brand-wordmark" src="/brand/wordmark.png?v=20260907-final" alt="G$LIDE"/>
    <img className="brand-symbol" src="/brand/symbol.png?v=20260907-final" alt="" aria-hidden="true"/>
  </a>;
}

export function Header({ utility }: { utility?: ReactNode } = {}) {
  return <header className="site-header"><div className="shell nav-wrap"><Logo/><nav className="desktop-nav" aria-label="Primary navigation"><a href="https://golidee.com/">Ventures</a><a href="https://golidee.com/research">Research</a><a href="https://golidee.com/founder">Founder</a><AdminStudioLink/><AccountControl/></nav>{utility}<a className="nav-cta" href="https://marketplace.golidee.com/">Marketplace <ArrowUpRight size={15}/></a><details className="mobile-menu"><summary aria-label="Open menu"><Menu size={22}/></summary><nav><a href="https://golidee.com/">Ventures</a><a href="https://golidee.com/research">Research</a><a href="https://golidee.com/founder">Founder</a><AdminStudioLink/><AccountControl/></nav></details></div></header>;
}

export function Footer({ showPartners = false }: { showPartners?: boolean } = {}) { return <footer><div className="shell footer-top"><div><Logo/><p>A founder-led ecosystem for software, markets and research.</p></div><div className="footer-links"><div><strong>Explore</strong><a href="https://marketplace.golidee.com/">Marketplace</a><a href="https://golidee.com/research">Research</a><a href="https://golidee.com/founder">Founder</a></div><div><strong>Systems</strong><AdminStudioLink/>{showPartners && <a href="https://marketplace.golidee.com/partners">Partners</a>}<a href="https://golidee.com/privacy">Privacy</a><a href="https://golidee.com/terms">Terms</a></div><div><strong>Connect</strong><a href="mailto:esiahsbusiness@gmail.com">Email</a></div></div></div><div className="shell footer-bottom"><span>© 2026 G$LIDE. Built from Lusaka.</span><span>Knowledge → Systems → Value</span></div></footer>; }
