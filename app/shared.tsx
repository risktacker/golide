import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import AccountControl from "./account-control";
import AdminStudioLink from "./admin-studio-link";
import MobileNav from "./mobile-nav";
import ThemeToggle from "./theme-toggle";
import { BrandLockup } from "./brand-mark";
import headerStyles from "./site-header.module.css";

export function Logo() {
  return <a className="logo brand-logo" href="https://golidee.com/" aria-label="GOLIDE home">
    <BrandLockup/>
  </a>;
}

export function Header({ utility }: { utility?: ReactNode } = {}) {
  return <header className={headerStyles.bar}>
    <div className={headerStyles.inner}>
      <a className={headerStyles.brand} href="https://golidee.com/" aria-label="GOLIDE home"><BrandLockup/></a>
      <nav className={headerStyles.links} aria-label="Primary navigation">
        <a href="https://golidee.com/">Ventures</a>
        <a href="https://golidee.com/research">Research</a>
        <a href="https://golidee.com/founder">Founder</a>
        <span className={headerStyles.system}>
          <AdminStudioLink className="nav-studio-link"/>
          <AccountControl/>
        </span>
      </nav>
      {utility}
      <ThemeToggle className={headerStyles.icon}/>
      <a className={headerStyles.cta} href="https://marketplace.golidee.com/">Marketplace <ArrowUpRight size={15}/></a>
      <MobileNav/>
    </div>
  </header>;
}

export function Footer({ showPartners = false }: { showPartners?: boolean } = {}) { return <footer><div className="shell footer-top"><div><Logo/><p>A founder-led ecosystem for software, markets and research.</p></div><div className="footer-links"><div><strong>Explore</strong><a href="https://marketplace.golidee.com/">Marketplace</a><a href="https://golidee.com/research">Research</a><a href="https://golidee.com/founder">Founder</a></div><div><strong>Systems</strong><AdminStudioLink/>{showPartners && <a href="https://marketplace.golidee.com/partners">Partners</a>}<a href="https://golidee.com/privacy">Privacy</a><a href="https://golidee.com/terms">Terms</a></div><div><strong>Connect</strong><a href="mailto:hello@golidee.com">Email</a></div></div></div><div className="shell footer-bottom"><span>© 2026 GOLIDE. Built from Lusaka.</span><span>Knowledge → Systems → Value</span></div></footer>; }
