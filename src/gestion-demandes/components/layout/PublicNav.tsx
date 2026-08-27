"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@gd/i18n";
import { LocaleSelector } from "./LocaleSelector";

const PUBLIC_LINKS = [
  { href: "/gestion-demandes/fonctionnement", translationKey: "nav.howItWorks" },
  { href: "/gestion-demandes/dashboard", translationKey: "nav.dashboard" },
] as const;

export function PublicNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <header className="public-nav">
      <Link href="/gestion-demandes" className="public-nav-brand">
        <span className="brand-mark" aria-hidden />
        <span>{t("brand.name")}</span>
      </Link>
      <nav className="public-nav-links" aria-label={t("nav.public")}>
        {PUBLIC_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`public-nav-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {t(link.translationKey)}
            </Link>
          );
        })}
        <a href="/#projet-phare" className="public-nav-link">
          {t("nav.portfolio")}
        </a>
        <LocaleSelector compact />
      </nav>
    </header>
  );
}
