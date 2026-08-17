import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Syne, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { profile } from "@/data/profile";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://alexisromney.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — Digitalisation, Automatisation & IA`,
    template: `%s · ${profile.name}`,
  },
  description: profile.tagline,
  applicationName: `${profile.name} Portfolio`,
  authors: [{ name: profile.name, url: profile.github }],
  creator: profile.name,
  keywords: [
    "Alexis Romney",
    "portfolio",
    "digitalisation",
    "automatisation",
    "intelligence artificielle",
    "outils métier",
    "gestion de projet IT",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: `${profile.name} Portfolio`,
    title: `${profile.name} — Digitalisation, Automatisation & IA`,
    description: profile.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — Digitalisation, Automatisation & IA`,
    description: profile.tagline,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#090b0e",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${sans.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col font-sans">
        <MotionProvider>
          <SmoothScroll>
            <a
              href="#contenu"
              className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:inline-flex focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-full focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--ink)] focus:[clip:auto]"
            >
              Aller au contenu
            </a>
            <Header />
            <div id="contenu" className="flex flex-1 flex-col">
              {children}
            </div>
            <Footer />
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
