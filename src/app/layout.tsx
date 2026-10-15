import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Syne, JetBrains_Mono } from "next/font/google";
import { profile } from "@/data/profile";
import { homeSeo } from "@/data/site-seo";
import { StructuredData } from "@/components/seo/StructuredData";
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
    default: homeSeo.title,
    template: `%s · ${profile.name}`,
  },
  description: homeSeo.description,
  applicationName: `${profile.name} Portfolio`,
  authors: [{ name: profile.name, url: profile.github }],
  creator: profile.name,
  keywords: [
    "solutions numériques",
    "digitalisation des entreprises",
    "conception de solutions numériques",
    "automatisation des processus",
    "création de site vitrine",
    "site institutionnel",
    "e-commerce sur mesure",
    "applications métier",
    "intelligence artificielle",
    "Alexis Romney",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: `${siteUrl}/`,
    siteName: `${profile.name} Portfolio`,
    title: homeSeo.title,
    description: homeSeo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: homeSeo.title,
    description: homeSeo.description,
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
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
