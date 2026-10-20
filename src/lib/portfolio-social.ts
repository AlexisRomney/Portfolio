import type { Locale } from "@/i18n/config";
import { getPortfolioDictionary } from "@/i18n/portfolio-dictionary";

/** Image statique pour Open Graph / Twitter (1200×630, letterboxing fond portfolio). */
export const PORTFOLIO_OG_IMAGE_PATH = "/brand/portfolio-og.png";

export const PORTFOLIO_OG_IMAGE_WIDTH = 1200;
export const PORTFOLIO_OG_IMAGE_HEIGHT = 630;

export function getPortfolioOgImageUrl(siteUrl: string): string {
  return `${siteUrl}${PORTFOLIO_OG_IMAGE_PATH}`;
}

export function getPortfolioOpenGraphImages(siteUrl: string, locale: Locale) {
  const dict = getPortfolioDictionary(locale);
  const url = getPortfolioOgImageUrl(siteUrl);

  return [
    {
      url,
      width: PORTFOLIO_OG_IMAGE_WIDTH,
      height: PORTFOLIO_OG_IMAGE_HEIGHT,
      alt: dict.seo.ogImageAlt,
      type: "image/png",
    },
  ];
}
