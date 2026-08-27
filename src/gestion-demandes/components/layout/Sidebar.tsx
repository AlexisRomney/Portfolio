"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, NAV_ITEMS } from "./nav";
import { NavIcon } from "./NavIcon";
import { LocaleSelector } from "./LocaleSelector";
import { useI18n } from "@gd/i18n";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="sidebar" aria-label={t("nav.main")}>
      <div className="sidebar-brand">
        <span className="brand-mark" aria-hidden />
        <div>
          <p className="brand-name">{t("brand.name")}</p>
          <p className="brand-tagline">{t("brand.tagline")}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <NavIcon icon={item.icon} className="nav-icon" />
              <span>{t(item.translationKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <LocaleSelector />
        <p className="muted">Version 0.1.0</p>
      </div>
    </aside>
  );
}
