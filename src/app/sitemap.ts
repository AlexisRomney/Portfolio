import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const homeEntries = locales.map((locale) => ({
    url: `${siteUrl}${localePath(locale)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: locale === "fr" ? 1 : 0.9,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${siteUrl}${localePath(l)}`]),
      ),
    },
  }));

  return [
    ...homeEntries,
    {
      url: `${siteUrl}/gestion-demandes`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
