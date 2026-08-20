/**
 * Absolute site origin for metadata / sitemap / robots.
 *
 * Important: an empty NEXT_PUBLIC_SITE_URL (common on Vercel when the var
 * exists but is blank) must not win over the fallback — `??` only skips
 * null/undefined, not "".
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    return `https://${vercelProduction.replace(/\/$/, "")}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  return "https://alexisromney.vercel.app";
}
