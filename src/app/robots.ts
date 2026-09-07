import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // APIs techniques uniquement — la démo publique /gestion-demandes reste crawlable.
      disallow: ["/api/", "/gestion-demandes/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
