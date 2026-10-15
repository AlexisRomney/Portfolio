import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";

/** Section projet phare sur le portfolio (locale alignée avec la démo). */
export function getPortfolioProjectUrl(locale: Locale): string {
  return `${localePath(locale)}#projet-phare`;
}
