import type { Metadata, Viewport } from "next";
import "./globals.css";
import { EntrySplash } from "./golide-loader";

export const metadata: Metadata = {
  metadataBase: new URL("https://golidee.com"),
  title: { default: "Digital Products, Software & Practical Tools | GOLIDE", template: "%s | GOLIDE" },
  description: "Discover digital products, practical tools, templates, software, learning systems and research-driven technology from GOLIDE.",
  applicationName: "GOLIDE",
  creator: "Esiah Kapinga",
  authors: [{ name: "Esiah Kapinga", url: "https://golidee.com/founder" }],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", siteName: "GOLIDE", title: "Digital Products, Software & Practical Tools | GOLIDE", description: "Digital products, practical tools, templates, software and research-driven technology built for real problems.", images: [{ url: "/og.webp", width: 1200, height: 630, alt: "GOLIDE digital products, software and technology" }] },
  twitter: { card: "summary_large_image", title: "Digital Products, Software & Practical Tools | GOLIDE", description: "Digital products, practical tools, templates, software and research-driven technology built for real problems.", images: ["/og.webp"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('golide-theme');if(t==='dark'){document.documentElement.dataset.theme='dark';document.documentElement.classList.add('dark')}if(!sessionStorage.getItem('golide-splash')&&!/^\\/(auth|login)/.test(location.pathname)){document.documentElement.dataset.splash='1'}}catch(e){}" }} />
        <link rel="icon" href="/favicon.ico?v=20261006" sizes="any" />
        <link rel="icon" href="/brand/favicon.png?v=20261006" sizes="512x512" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=20261006" />
      </head>
      <body className="antialiased">
        <EntrySplash/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": "https://golidee.com/#organization", name: "GOLIDE", url: "https://golidee.com", logo: "https://golidee.com/brand/favicon.png", description: "A digital products, software, research and technology platform.", founder: { "@id": "https://golidee.com/founder#person" } },
            { "@type": "Person", "@id": "https://golidee.com/founder#person", name: "Esiah Kapinga", givenName: "Esiah", familyName: "Kapinga", url: "https://golidee.com/founder", image: "https://golidee.com/founder/profile-suit-standing.webp", jobTitle: "Founder of GOLIDE", description: "Zambian microbiologist, software developer and founder of GOLIDE.", nationality: { "@type": "Country", name: "Zambia" }, homeLocation: { "@type": "Place", name: "Lusaka, Zambia" }, alumniOf: { "@type": "CollegeOrUniversity", name: "Marwadi University" }, hasCredential: { "@type": "EducationalOccupationalCredential", name: "BSc Microbiology, First Class with Distinction" }, worksFor: { "@id": "https://golidee.com/#organization" }, knowsAbout: ["Microbiology", "Bioinformatics", "Phylogenetics", "Public health data analytics", "DHIS2", "Software development", "AI data analytics", "Quality assurance"], sameAs: ["https://www.linkedin.com/in/esiah-kapinga", "https://github.com/esiiah", "https://www.youtube.com/@esiah.1", "https://www.instagram.com/esiah_kapinga", "https://esiiah.github.io/portfolio-site/"] },
            { "@type": "WebSite", "@id": "https://golidee.com/#website", url: "https://golidee.com", name: "GOLIDE", description: "Digital products, software, practical tools and research-driven technology.", publisher: { "@id": "https://golidee.com/#organization" }, inLanguage: "en" }
          ]
        }).replace(/</g, "\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
