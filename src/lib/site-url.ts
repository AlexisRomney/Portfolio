/**
 * Absolute site origin for metadata / sitemap / robots.
 *
 * Canonical host: https://alexis-romney.com (no www, always https).
 *
 * Important: an empty NEXT_PUBLIC_SITE_URL (common on Vercel when the var
 * exists but is blank) must not win over the fallback — `??` only skips
 * null/undefined, not "".
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return normalizeSiteOrigin(configured);
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    return normalizeSiteOrigin(`https://${vercelProduction}`);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return normalizeSiteOrigin(`https://${vercelUrl}`);
  }

  return "https://alexis-romney.com";
}

/** Force https + strip trailing slash + drop leading www. */
function normalizeSiteOrigin(value: string): string {
  const withProtocol = value.includes("://") ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    url.protocol = "https:";
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
    }
    url.hash = "";
    url.search = "";
    url.pathname = "";
    return url.origin.replace(/\/$/, "");
  } catch {
    return value.replace(/\/$/, "").replace(/^http:\/\//i, "https://");
  }
}
