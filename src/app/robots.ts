import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // APIs techniques uniquement.
      // /gestion-demandes reste accessible aux visiteurs (noindex via metadata, hors sitemap).
      disallow: ["/api/", "/gestion-demandes/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
