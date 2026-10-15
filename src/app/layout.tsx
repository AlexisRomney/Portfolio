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
    default: profile.name,
    template: `%s · ${profile.name}`,
  },
  applicationName: `${profile.name} Portfolio`,
  authors: [{ name: profile.name, url: profile.github }],
  creator: profile.name,
  robots: {
    index: true,
    follow: true,
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
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
