"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, NAV_ITEMS } from "./nav";
import { NavIcon } from "./NavIcon";
import { LocaleSelector } from "./LocaleSelector";
import { useI18n } from "@gd/i18n";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="mobile-nav" aria-label={t("nav.mobile")}>
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-link${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <NavIcon icon={item.icon} className="nav-icon" />
            <span>{t(item.translationKey)}</span>
          </Link>
        );
      })}
      <LocaleSelector compact />
    </nav>
  );
}
