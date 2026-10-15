"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@gd/i18n";
import { getPortfolioProjectUrl } from "@gd/lib/portfolio-url";
import { LocaleSelector } from "./LocaleSelector";

const NEW_REQUEST_HREF = "/gestion-demandes";

const PUBLIC_LINKS = [
  { href: NEW_REQUEST_HREF, translationKey: "nav.newRequest" as const },
  {
    href: "/gestion-demandes/dashboard",
    translationKey: "nav.dashboardAdmin" as const,
  },
  { href: "/gestion-demandes/fonctionnement", translationKey: "nav.howItWorks" as const },
] as const;

function isLinkActive(pathname: string, href: string): boolean {
  if (href === NEW_REQUEST_HREF) {
    return pathname === NEW_REQUEST_HREF || pathname === `${NEW_REQUEST_HREF}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicNav() {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const portfolioHref = getPortfolioProjectUrl(locale);

  return (
    <header className="public-nav">
      <Link href="/gestion-demandes" className="public-nav-brand">
        <span className="brand-mark" aria-hidden />
        <span>{t("brand.name")}</span>
      </Link>
      <nav className="public-nav-links" aria-label={t("nav.public")}>
        <div className="public-nav-toolbar">
          <div className="public-nav-group">
            {PUBLIC_LINKS.map((link) => {
              const active = isLinkActive(pathname, link.href);
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
          </div>
          <div className="public-nav-group public-nav-group--meta">
            <LocaleSelector compact />
            <Link href={portfolioHref} className="public-nav-link public-nav-link-portfolio">
              {t("nav.backToPortfolio")}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
