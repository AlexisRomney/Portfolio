import { profile } from "@/data/profile";
import type { Locale } from "@/i18n/config";
import { getPortfolioDictionary } from "@/i18n/portfolio-dictionary";
import { getSiteUrl } from "@/lib/site-url";

export function PortfolioStructuredData({ locale }: { locale: Locale }) {
  const siteUrl = getSiteUrl();
  const dict = getPortfolioDictionary(locale);
  const personId = `${siteUrl}/#person`;
  const websiteId = `${siteUrl}/#website`;
  const pageUrl = `${siteUrl}/${locale}`;

  const sameAs = [profile.linkedin, profile.github].filter(Boolean);

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": personId,
    name: profile.name,
    url: pageUrl,
    jobTitle: dict.seo.h1,
    description: dict.seo.description,
    sameAs,
  };

  if (profile.photo) {
    person.image = `${siteUrl}${profile.photo.startsWith("/") ? profile.photo : `/${profile.photo}`}`;
  }

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: pageUrl,
        name: dict.seo.websiteName,
        description: dict.seo.description,
        inLanguage: locale === "en" ? "en-US" : "fr-FR",
        publisher: { "@id": personId },
      },
      person,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
