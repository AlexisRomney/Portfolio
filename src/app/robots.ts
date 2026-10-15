import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // APIs techniques uniquement — /gestion-demandes reste indexable.
      disallow: ["/api/", "/gestion-demandes/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
