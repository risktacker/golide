import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://golide-hub.esiahkapinga.chatgpt.site"),
  title: { default: "GOLIDE — Where ideas become systems", template: "%s — GOLIDE" },
  description: "A founder-led ecosystem building practical software, intelligent trading tools and research-driven digital products.",
  openGraph: { title: "GOLIDE — Where ideas become systems", description: "Software, intelligent trading tools and research-driven digital products.", images: ["/og.webp"] },
  twitter: { card: "summary_large_image", title: "GOLIDE — Where ideas become systems", description: "Software, intelligent trading tools and research-driven digital products.", images: ["/og.webp"] },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
