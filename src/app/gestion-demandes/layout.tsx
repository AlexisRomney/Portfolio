import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppShell } from "@gd/components/layout/AppShell";
import { LocaleProvider } from "@gd/components/providers/LocaleProvider";
import "@gd/styles/globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Assistant IA — Gestion des demandes",
  description:
    "Démonstration interactive : transformez automatiquement les demandes en décisions métier exploitables.",
  robots: { index: false, follow: false },
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
