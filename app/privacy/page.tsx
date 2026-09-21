import type { Metadata } from "next";
import { Footer, Header } from "../shared";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How GOLIDE handles information across golidee.com and its marketplace.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage(){
  return <main className={styles.page}>
    <Header/>
    <section className={styles.hero}>
      <div className="shell">
        <p className={styles.kicker}>GOLIDE / LEGAL</p>
        <h1>Privacy Policy</h1>
        <p>This policy explains what information GOLIDE may collect, why it is used, and the choices available to you when you use our website, marketplace, products, and related services.</p>
        <span className={styles.updated}>Last updated · September 22, 2026</span>
      </div>
    </section>
    <section className={"shell "+styles.content}>
      <div className={styles.copy}>
        <section className={styles.section}><h2>1. Information we collect</h2><p>We may receive information you provide directly, such as your name, email address, account details, messages, support requests, and information submitted when using a GOLIDE product or service.</p><p>We may also collect basic technical and usage information such as device or browser type, pages visited, timestamps, referral information, and security or diagnostic events needed to operate and protect the service.</p></section>
        <section className={styles.section}><h2>2. Accounts and authentication</h2><p>When you sign in, an authentication provider may process identity information needed to create and maintain your session. We use that information to provide account access, protect restricted areas, and distinguish administrative access from public access.</p></section>
        <section className={styles.section}><h2>3. Payments and purchases</h2><p>Payments may be handled by third-party checkout or marketplace providers. GOLIDE does not need to store your full payment-card details when those providers process the transaction. Their own privacy terms also apply to information they process.</p></section>
        <section className={styles.section}><h2>4. How information is used</h2><ul><li>Provide, maintain, secure, and improve GOLIDE services.</li><li>Deliver purchased digital products or requested functionality.</li><li>Authenticate users and protect administrative systems.</li><li>Respond to support, business, or partnership enquiries.</li><li>Measure reliability, diagnose failures, and prevent abuse.</li><li>Meet legal, accounting, security, or compliance obligations where applicable.</li></ul></section>
        <section className={styles.section}><h2>5. Third-party services</h2><p>GOLIDE may rely on third parties for hosting, authentication, storage, analytics, payment processing, communications, and platform integrations. Those providers process information under their own terms and policies. We only use access that is needed for the relevant service or integration.</p></section>
        <section className={styles.section}><h2>6. Data retention and security</h2><p>We retain information only for as long as it is reasonably needed for the purpose it was collected, operational continuity, security, legal obligations, or dispute resolution. We use reasonable technical and organisational safeguards, but no internet service can guarantee absolute security.</p></section>
        <section className={styles.section}><h2>7. Your choices</h2><p>You may contact us to ask about personal information associated with you, request correction, or request deletion where applicable. Some records may need to be retained when required for security, legal, tax, fraud-prevention, or transaction purposes.</p></section>
        <section className={styles.section}><h2>8. Children</h2><p>GOLIDE services are not intentionally directed to children under the age required to consent to online services in their jurisdiction. If we learn that personal information was collected inappropriately, we will take reasonable steps to address it.</p></section>
        <section className={styles.section}><h2>9. Changes to this policy</h2><p>We may update this policy as the platform changes. The date shown above indicates the latest published version. Material changes may also be communicated through the service when appropriate.</p></section>
      </div>
      <aside className={styles.aside}><strong>Privacy contact</strong><p>Questions about this policy or information associated with you can be sent directly to GOLIDE.</p><a href="mailto:esiahsbusiness@gmail.com">esiahsbusiness@gmail.com</a></aside>
    </section>
    <Footer/>
  </main>
}
