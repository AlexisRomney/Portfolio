import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Syne, JetBrains_Mono } from "next/font/google";
import { profile } from "@/data/profile";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const sans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — Création Web & Solutions numériques`,
    template: `%s · ${profile.name}`,
  },
  description: profile.tagline,
  applicationName: `${profile.name} Portfolio`,
  authors: [{ name: profile.name, url: profile.github }],
  creator: profile.name,
  keywords: [
    "Alexis Romney",
    "portfolio",
    "création web",
    "sites vitrines",
    "e-commerce",
    "applications web",
    "digitalisation",
    "automatisation",
    "intelligence artificielle",
    "outils métier",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: `${siteUrl}/`,
    siteName: `${profile.name} Portfolio`,
    title: `${profile.name} — Création Web & Solutions numériques`,
    description: profile.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — Création Web & Solutions numériques`,
    description: profile.tagline,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/`,
  },
};

export const viewport: Viewport = {
  themeColor: "#090b0e",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${sans.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
