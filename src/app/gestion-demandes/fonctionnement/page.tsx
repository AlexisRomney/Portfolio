"use client";

import { Button } from "@gd/components/ui/Button";
import { useI18n } from "@gd/i18n";
import { getPortfolioProjectUrl } from "@gd/lib/portfolio-url";

export default function FonctionnementPage() {
  const { locale, t } = useI18n();
  const portfolioHref = getPortfolioProjectUrl(locale);
  return (
    <div className="landing-page">
      <header className="landing-hero">
        <p className="landing-brand">{t("brand.name")}</p>
        <h1>{t("function.title")}</h1>
        <p className="landing-subtitle">
          {t("function.subtitle")}
        </p>
      </header>

      <section className="landing-flow" aria-label={t("function.flow")}>
        <div className="landing-flow-step">
          <span className="landing-flow-index">1</span>
          <h2>{t("function.request")}</h2>
          <p>{t("function.requestText")}</p>
        </div>
        <div className="landing-flow-arrow" aria-hidden>
          ↓
        </div>
        <div className="landing-flow-step">
          <span className="landing-flow-index">2</span>
          <h2>{t("function.analysis")}</h2>
          <p>{t("function.analysisText")}</p>
        </div>
        <div className="landing-flow-arrow" aria-hidden>
          ↓
        </div>
        <div className="landing-flow-step">
          <span className="landing-flow-index">3</span>
          <h2>{t("function.routing")}</h2>
          <p>{t("function.routingText")}</p>
        </div>
        <div className="landing-flow-arrow" aria-hidden>
          ↓
        </div>
        <div className="landing-flow-step">
          <span className="landing-flow-index">4</span>
          <h2>{t("function.response")}</h2>
          <p>{t("function.responseText")}</p>
        </div>
        <div className="landing-flow-arrow" aria-hidden>
          ↓
        </div>
        <div className="landing-flow-step">
          <span className="landing-flow-index">5</span>
          <h2>{t("function.control")}</h2>
          <p>{t("function.controlText")}</p>
        </div>
        <div className="landing-flow-arrow" aria-hidden>
          ↓
        </div>
        <div className="landing-flow-step">
          <span className="landing-flow-index">6</span>
          <h2>{t("function.automation")}</h2>
          <p>{t("function.automationText")}</p>
          <p style={{ marginTop: "0.65rem" }}>
            {t("function.automationClarification")}
          </p>
        </div>
      </section>

      <section className="landing-note">
        <p>{t("function.note")}</p>
        <Button href={portfolioHref} variant="secondary" className="landing-note-cta">
          {t("nav.backToPortfolio")}
        </Button>
      </section>
    </div>
  );
}
