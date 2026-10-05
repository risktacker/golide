import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import AccountControl from "./account-control";
import AdminStudioLink from "./admin-studio-link";
import MobileNav from "./mobile-nav";
import ThemeToggle from "./theme-toggle";
import { BrandLockup } from "./brand-mark";

export function Logo() {
  return <a className="logo brand-logo" href="https://golidee.com/" aria-label="GOLIDE home">
    <BrandLockup/>
  </a>;
}

export function Header({ utility }: { utility?: ReactNode } = {}) {
  return <header className="site-header">
    <div className="shell nav-wrap">
      <Logo/>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <div className="nav-primary">
          <a href="https://golidee.com/">Ventures</a>
          <a href="https://golidee.com/research">Research</a>
          <a href="https://golidee.com/founder">Founder</a>
        </div>
        <div className="nav-system">
          <AdminStudioLink className="nav-studio-link"/>
          <AccountControl/>
        </div>
      </nav>
      {utility}
      <ThemeToggle/>
      <a className="nav-cta" href="https://marketplace.golidee.com/">Marketplace <ArrowUpRight size={15}/></a>
      <MobileNav/>
    </div>
  </header>;
}

export function Footer({ showPartners = false }: { showPartners?: boolean } = {}) { return <footer><div className="shell footer-top"><div><Logo/><p>A founder-led ecosystem for software, markets and research.</p></div><div className="footer-links"><div><strong>Explore</strong><a href="https://marketplace.golidee.com/">Marketplace</a><a href="https://golidee.com/research">Research</a><a href="https://golidee.com/founder">Founder</a></div><div><strong>Systems</strong><AdminStudioLink/>{showPartners && <a href="https://marketplace.golidee.com/partners">Partners</a>}<a href="https://golidee.com/privacy">Privacy</a><a href="https://golidee.com/terms">Terms</a></div><div><strong>Connect</strong><a href="mailto:esiahsbusiness@gmail.com">Email</a></div></div></div><div className="shell footer-bottom"><span>© 2026 GOLIDE. Built from Lusaka.</span><span>Knowledge → Systems → Value</span></div></footer>; }
