import { ImageResponse } from "next/og";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getLocalizedProfile } from "@/data/profile-locale";
import { getPortfolioDictionary } from "@/i18n/portfolio-dictionary";
import {
  PORTFOLIO_OG_IMAGE_HEIGHT,
  PORTFOLIO_OG_IMAGE_WIDTH,
} from "@/lib/portfolio-social";
import { profile } from "@/data/profile";

export const alt = "Alexis Romney — Portfolio";
export const size = {
  width: PORTFOLIO_OG_IMAGE_WIDTH,
  height: PORTFOLIO_OG_IMAGE_HEIGHT,
};
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getPortfolioDictionary(locale);
  const localized = getLocalizedProfile(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(145deg, #090b0e 0%, #121820 48%, #0f1c1a 100%)",
          color: "#f4f1ea",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#c6a46b",
              color: "#090b0e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            AR
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 28,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#c6a46b",
            }}
          >
            {localized.role}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <p
            style={{
              margin: 0,
              fontSize: 64,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 980,
            }}
          >
            {dict.seo.h1}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 30,
              lineHeight: 1.35,
              color: "#b8c0c8",
              maxWidth: 920,
            }}
          >
            {profile.name}
          </p>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 22,
            color: "#8a939c",
          }}
        >
          alexis-romney.com
        </p>
      </div>
    ),
    size,
  );
}
