import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://golidee.com"),
  title: { default: "GOLIDE — Build what comes next", template: "%s — GOLIDE" },
  description: "The GOLIDE hub for software, intelligence, scientific research and the people building what comes next.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: "GOLIDE", title: "GOLIDE — Build what comes next", description: "Software, intelligence, scientific research and connected digital products.", images: [{ url: "/og.webp", width: 1200, height: 630, alt: "GOLIDE" }] },
  twitter: { card: "summary_large_image", title: "GOLIDE — Build what comes next", description: "Software, intelligence, scientific research and connected digital products.", images: ["/og.webp"] },
  icons: {
    icon: [
      { url: "/favicon.ico?v=20260907-final", sizes: "64x64", type: "image/x-icon" },
      { url: "/brand/favicon.png?v=20260907-final", sizes: "1254x1254", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=20260907-final",
    apple: "/apple-touch-icon.png?v=20260907-final",
  },
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
    <html lang="en" className="dark">
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": "https://golidee.com/#organization", name: "GOLIDE", url: "https://golidee.com", logo: "https://golidee.com/brand/favicon.png", founder: { "@type": "Person", name: "Esiah Kapinga", url: "https://golidee.com/founder" } },
            { "@type": "WebSite", "@id": "https://golidee.com/#website", url: "https://golidee.com", name: "GOLIDE", publisher: { "@id": "https://golidee.com/#organization" } }
          ]
        }).replace(/</g, "\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
