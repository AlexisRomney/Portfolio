import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppShell } from "@gd/components/layout/AppShell";
import { LocaleProvider } from "@gd/components/providers/LocaleProvider";
import { getSiteUrl } from "@/lib/site-url";
import "@gd/styles/globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = getSiteUrl();
const demoPath = "/gestion-demandes";
const demoUrl = `${siteUrl}${demoPath}`;

export const metadata: Metadata = {
  title: "Assistant IA — Gestion des demandes",
  description:
    "Démonstration interactive : transformez automatiquement les demandes clients en décisions métier exploitables grâce à l’analyse IA, au routage et à l’automatisation.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: demoUrl,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: demoUrl,
    siteName: "Alexis Romney Portfolio",
    title: "Assistant IA — Gestion des demandes",
    description:
      "Démonstration interactive d’un assistant IA de gestion des demandes : analyse, classification, routage et automatisation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistant IA — Gestion des demandes",
    description:
      "Démonstration interactive d’un assistant IA de gestion des demandes : analyse, classification, routage et automatisation.",
  },
};

export default function GestionDemandesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`gd-demo-root ${jakarta.variable}`}>
      <LocaleProvider>
        <AppShell>{children}</AppShell>
      </LocaleProvider>
    </div>
  );
}
