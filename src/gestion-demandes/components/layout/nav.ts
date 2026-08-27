import type { TranslationKey } from "@gd/i18n/fr";

export type NavItem = {
  href: string;
  translationKey: TranslationKey;
  icon: "dashboard" | "requests" | "new" | "settings";
  match: "exact" | "prefix";
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/gestion-demandes/dashboard",
    translationKey: "nav.dashboard",
    icon: "dashboard",
    match: "exact",
  },
  {
    href: "/gestion-demandes/demandes",
    translationKey: "nav.requests",
    icon: "requests",
    match: "prefix",
  },
  {
    href: "/gestion-demandes/parametres",
    translationKey: "nav.settings",
    icon: "settings",
    match: "exact",
  },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.match === "exact") {
    return pathname === item.href;
  }

  if (item.href === "/gestion-demandes/demandes") {
    return pathname === "/gestion-demandes/demandes" || pathname.startsWith("/gestion-demandes/demandes/");
  }

  return pathname.startsWith(item.href);
}
