import type { Metadata, Viewport } from "next";
import "./globals.css";
import { EntrySplash } from "./golide-loader";

export const metadata: Metadata = {
  metadataBase: new URL("https://golidee.com"),
  title: { default: "Digital Products, Software & Practical Tools | GOLIDE", template: "%s | GOLIDE" },
  description: "Discover digital products, practical tools, templates, software, learning systems and research-driven technology from GOLIDE.",
  keywords: [
    "digital products", "digital marketplace", "online tools", "digital toolkits",
    "business templates", "productivity tools", "creator tools", "career tools",
    "learning resources", "AI software", "data analytics tools", "trading tools",
    "research software", "bioinformatics tools", "public health data analytics",
  ],
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
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('golide-theme');if(t==='light'){document.documentElement.dataset.theme='light';document.documentElement.classList.remove('dark')}if(!sessionStorage.getItem('golide-splash')&&!/^\\/(auth|login)/.test(location.pathname)){document.documentElement.dataset.splash='1'}}catch(e){}" }} />
        <link rel="icon" href="/favicon.ico?v=20260912" sizes="64x64" type="image/x-icon" />
        <link rel="icon" href="/brand/favicon.png?v=20260912" sizes="1254x1254" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=20260912" />
      </head>
      <body className="antialiased">
        <EntrySplash/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": "https://golidee.com/#organization", name: "GOLIDE", url: "https://golidee.com", logo: "https://golidee.com/brand/favicon.png", description: "A digital products, software, research and technology platform.", founder: { "@id": "https://golidee.com/founder#person" } },
            { "@type": "Person", "@id": "https://golidee.com/founder#person", name: "Esiah Kapinga", url: "https://golidee.com/founder", jobTitle: "Founder of GOLIDE", sameAs: ["https://www.youtube.com/@esiah.1"] },
            { "@type": "WebSite", "@id": "https://golidee.com/#website", url: "https://golidee.com", name: "GOLIDE", description: "Digital products, software, practical tools and research-driven technology.", publisher: { "@id": "https://golidee.com/#organization" }, inLanguage: "en" }
          ]
        }).replace(/</g, "\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
