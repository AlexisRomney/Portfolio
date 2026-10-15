import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SetHtmlLang } from "@/components/providers/SetHtmlLang";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { PortfolioStructuredData } from "@/components/seo/PortfolioStructuredData";
import { profile } from "@/data/profile";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { getPortfolioDictionary } from "@/i18n/portfolio-dictionary";
import { getSiteUrl } from "@/lib/site-url";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getPortfolioDictionary(locale);
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${localePath(locale)}`;
  const alternateFr = `${siteUrl}${localePath("fr")}`;
  const alternateEn = `${siteUrl}${localePath("en")}`;

  return {
    title: { absolute: dict.seo.title },
    description: dict.seo.description,
    keywords: dict.seo.keywords,
    alternates: {
      canonical,
      languages: {
        fr: alternateFr,
        en: alternateEn,
        "x-default": alternateFr,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "fr_FR",
      alternateLocale: locale === "en" ? ["fr_FR"] : ["en_US"],
      url: canonical,
      siteName: `${profile.name} Portfolio`,
      title: dict.seo.title,
      description: dict.seo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.seo.title,
      description: dict.seo.description,
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }

  const locale = raw;
  const dict = getPortfolioDictionary(locale);

  return (
    <LocaleProvider locale={locale}>
      <SetHtmlLang locale={locale} />
      <PortfolioStructuredData locale={locale} />
      <div className="grain flex min-h-full flex-1 flex-col">
        <MotionProvider>
          <SmoothScroll>
            <a
              href="#contenu"
              className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:inline-flex focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-full focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--ink)] focus:[clip:auto]"
            >
              {dict.a11y.skipToContent}
            </a>
            <Header />
            <div id="contenu" className="flex flex-1 flex-col">
              {children}
            </div>
            <Footer />
          </SmoothScroll>
        </MotionProvider>
      </div>
    </LocaleProvider>
  );
}
