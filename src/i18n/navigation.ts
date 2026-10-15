import type { Locale } from "@/i18n/config";

/** Home and other portfolio pages under a locale prefix. */
export function localePath(locale: Locale, path = ""): string {
  const suffix = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `/${locale}${suffix}`;
}

export function switchLocalePath(currentLocale: Locale, targetLocale: Locale): string {
  return localePath(targetLocale);
}
