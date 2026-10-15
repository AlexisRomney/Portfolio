import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

const CANONICAL_HOST = "alexis-romney.com";

const LOCALE_PREFIX_RE = /^\/(fr|en)(\/|$)/;

function shouldSkipLocale(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/gestion-demandes") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/icon" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

/**
 * Consolidate host variants on the production domain:
 * www.alexis-romney.com → alexis-romney.com
 *
 * HTTP → HTTPS is handled by the hosting platform (Vercel).
 */
export function middleware(request: NextRequest) {
  const hostHeader = request.headers.get("host") ?? "";
  const hostname = hostHeader.split(":")[0]?.toLowerCase() ?? "";

  if (hostname === `www.${CANONICAL_HOST}`) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const { pathname } = request.nextUrl;

  if (shouldSkipLocale(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  const match = pathname.match(LOCALE_PREFIX_RE);
  if (match && !isLocale(match[1])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
