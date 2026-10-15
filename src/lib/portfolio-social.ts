import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { getPortfolioDictionary } from "@/i18n/portfolio-dictionary";

export const PORTFOLIO_OG_IMAGE_WIDTH = 1200;
export const PORTFOLIO_OG_IMAGE_HEIGHT = 630;

/** Chemin public de l’image Open Graph générée par Next (`opengraph-image.tsx`). */
export function getPortfolioOgImagePath(locale: Locale): string {
  return `${localePath(locale)}/opengraph-image`;
}

export function getPortfolioOgImageUrl(siteUrl: string, locale: Locale): string {
  return `${siteUrl}${getPortfolioOgImagePath(locale)}`;
}

export function getPortfolioOpenGraphImages(siteUrl: string, locale: Locale) {
  const dict = getPortfolioDictionary(locale);
  const url = getPortfolioOgImageUrl(siteUrl, locale);

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
