import { profile } from "@/data/profile";
import { homeSeo } from "@/data/site-seo";
import { getSiteUrl } from "@/lib/site-url";

/** JSON-LD @graph for the portfolio (WebSite + Person). Facts only from site data. */
export function getPortfolioStructuredData() {
  const siteUrl = getSiteUrl();
  const personId = `${siteUrl}/#person`;
  const websiteId = `${siteUrl}/#website`;

  const sameAs = [profile.linkedin, profile.github].filter(Boolean);

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": personId,
    name: profile.name,
    url: `${siteUrl}/`,
    jobTitle: profile.role,
    description: profile.tagline,
    sameAs,
  };

  if (profile.photo) {
    person.image = `${siteUrl}${profile.photo.startsWith("/") ? profile.photo : `/${profile.photo}`}`;
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: `${siteUrl}/`,
        name: `${profile.name} — Portfolio`,
        description: homeSeo.description,
        inLanguage: "fr-FR",
        publisher: { "@id": personId },
      },
      person,
    ],
  };
}
