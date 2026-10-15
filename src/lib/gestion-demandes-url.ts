import type { Locale } from "@/i18n/config";

const DEMO_PATH = "/gestion-demandes";

/** Ouvre la démo en conservant la langue du portfolio (mécanisme `?lang=` côté démo). */
export function resolveDemoHref(href: string | null, locale: Locale): string | null {
  if (!href) return null;
  if (href === DEMO_PATH || href.startsWith(`${DEMO_PATH}?`) || href.startsWith(`${DEMO_PATH}/`)) {
    const base = href.split("?")[0];
    return `${base}?lang=${locale}`;
  }
  return href;
}
