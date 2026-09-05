import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://golide-hub.esiahkapinga.chatgpt.site"),
  title: { default: "G$LIDE — Build what comes next", template: "%s — G$LIDE" },
  description: "The GOLIDE hub for software, intelligence, scientific research and the people building what comes next.",
  openGraph: { title: "G$LIDE — Build what comes next", description: "Software, intelligence, scientific research and connected digital products.", images: ["/og.webp"] },
  twitter: { card: "summary_large_image", title: "G$LIDE — Build what comes next", description: "Software, intelligence, scientific research and connected digital products.", images: ["/og.webp"] },
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/favicon.png",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
