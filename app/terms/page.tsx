import type { Metadata } from "next";
import { Footer, Header } from "../shared";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of GOLIDE websites, marketplace, digital products, and services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage(){
  return <main className={styles.page}>
    <Header/>
    <section className={styles.hero}>
      <div className="shell">
        <p className={styles.kicker}>GOLIDE / LEGAL</p>
        <h1>Terms of Use</h1>
        <p>These terms govern your use of golidee.com, the GOLIDE marketplace, and GOLIDE digital products, tools, software, and related services.</p>
        <span className={styles.updated}>Last updated · September 22, 2026</span>
      </div>
    </section>
    <section className={"shell "+styles.content}>
      <div className={styles.copy}>
        <section className={styles.section}><h2>1. Using GOLIDE</h2><p>By using GOLIDE, you agree to use the service lawfully and in a way that does not interfere with the service, compromise security, attempt unauthorised access, or misuse another person&apos;s account or information.</p></section>
        <section className={styles.section}><h2>2. Digital products and services</h2><p>Product descriptions explain what is included at the time of purchase or access. Features, formats, delivery methods, and availability may evolve as products are improved. Any material purchase terms shown at checkout also form part of the applicable transaction.</p></section>
        <section className={styles.section}><h2>3. No guaranteed outcomes</h2><p>GOLIDE products and content are designed to provide tools, information, systems, or practical assistance. Unless expressly stated otherwise, we do not guarantee employment, income, sales, trading results, business performance, academic outcomes, or any other specific result.</p></section>
        <section className={styles.section}><h2>4. Payments, fulfilment, and refunds</h2><p>Payments may be processed by third-party checkout or marketplace providers. Pricing, taxes, payment methods, fulfilment, refund eligibility, and transaction-specific conditions may also be governed by the terms presented by that provider or on the relevant product page at the time of purchase.</p></section>
        <section className={styles.section}><h2>5. Intellectual property</h2><p>GOLIDE branding, product content, software, designs, written materials, media, and other original materials remain protected by applicable intellectual-property rights unless a separate licence says otherwise. Purchasing or accessing a product does not transfer ownership of the underlying intellectual property.</p><p>You may not copy, resell, redistribute, publish, reverse engineer, or commercially exploit protected GOLIDE materials beyond the permissions granted with the relevant product or service.</p></section>
        <section className={styles.section}><h2>6. External services and links</h2><p>Some GOLIDE functionality depends on third-party platforms, APIs, payment providers, hosting services, or external websites. We are not responsible for changes, outages, policies, or actions controlled by those third parties.</p></section>
        <section className={styles.section}><h2>7. Availability and changes</h2><p>We may update, improve, suspend, or discontinue features where reasonably necessary for security, maintenance, product development, legal requirements, or operational reasons. We do not promise uninterrupted or error-free availability.</p></section>
        <section className={styles.section}><h2>8. Limitation of responsibility</h2><p>To the extent permitted by applicable law, GOLIDE is not responsible for indirect, incidental, or consequential losses arising from reliance on informational content, third-party services, or misuse of the platform. Nothing in these terms excludes rights or responsibilities that cannot lawfully be excluded.</p></section>
        <section className={styles.section}><h2>9. Changes to these terms</h2><p>We may update these terms as GOLIDE evolves. Continued use after an updated version is published means the current terms apply to subsequent use, subject to any rights provided by applicable law.</p></section>
      </div>
      <aside className={styles.aside}><strong>Questions?</strong><p>If you need clarification about these terms, a purchase, or a GOLIDE service, contact us directly.</p><a href="mailto:esiahsbusiness@gmail.com">esiahsbusiness@gmail.com</a></aside>
    </section>
    <Footer/>
  </main>
}
