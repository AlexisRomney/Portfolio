"use client";

import { useEffect, useState } from "react";
import { Header } from "@gd/components/layout/Header";
import { InfoTooltip } from "@gd/components/ui/InfoTooltip";
import { Card } from "@gd/components/ui/Card";
import { useI18n } from "@gd/i18n";

type SettingKey =
  | "autoAnalysis"
  | "replySuggestions"
  | "autoClassification";

const INITIAL_SETTINGS: Record<SettingKey, boolean> = {
  autoAnalysis: true,
  replySuggestions: true,
  autoClassification: true,
};

type AutomationSettings = {
  controlScoreThreshold: number;
  autoSendResponses: boolean;
};

export default function ParametresPage() {
  const { t, translateApiText } = useI18n();
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [threshold, setThreshold] = useState(90);
  const [autoSend, setAutoSend] = useState(false);
  const [automationReady, setAutomationReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/gestion-demandes/api/settings", { cache: "no-store" });
        const data = (await response.json()) as {
          settings?: AutomationSettings;
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok || !data.settings) {
          setError(data.error ? translateApiText(data.error) : t("settings.loadError"));
          return;
        }
        setThreshold(data.settings.controlScoreThreshold);
        setAutoSend(data.settings.autoSendResponses);
        setAutomationReady(true);
        setError(null);
      } catch {
        if (!cancelled) {
          setError(t("settings.loadError"));
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [t, translateApiText]);

  function toggle(key: SettingKey) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div>
      <Header
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
      />

      <div className="settings-stack">
        <Card className="settings-card">
          <h2>{t("settings.aiAutomation")}</h2>
          <p className="muted" style={{ fontSize: "0.88rem", marginBottom: "1rem" }}>
            Lecture seule dans la démonstration — les réglages globaux ne peuvent
            pas être modifiés.
          </p>
          <div className="settings-list">
            <div className="settings-row settings-row-stack">
              <div>
                <div className="ai-panel-title-row" style={{ fontWeight: 600 }}>
                  <span>{t("settings.threshold")}</span>
                  <InfoTooltip text={t("settings.thresholdTooltip")} />
                </div>
                <p className="muted" style={{ fontSize: "0.88rem" }}>
                  {t("settings.thresholdText")}
                </p>
              </div>
              <div className="settings-threshold">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={threshold}
                  disabled
                  readOnly
                  aria-label={t("settings.threshold")}
                />
                <strong>{threshold} %</strong>
              </div>
            </div>

            <div className="settings-row">
              <div>
                <p style={{ fontWeight: 600 }}>
                  {t("settings.autoSend")}
                </p>
                <p className="muted" style={{ fontSize: "0.88rem" }}>
                  {autoSend
                    ? t("settings.autoSendOn")
                    : t("settings.autoSendOff")}
                </p>
              </div>
              <button
                type="button"
                className={`switch${autoSend ? " is-on" : ""}`}
                aria-pressed={autoSend}
                aria-label={t("settings.autoSend")}
                disabled
              />
            </div>
          </div>
          {error ? (
            <p className="alert alert-warning" role="alert">
              {error}
            </p>
          ) : null}
          {automationReady ? (
            <p className="muted" style={{ fontSize: "0.85rem", marginTop: "0.75rem" }}>
              Lecture seule — aucune modification n’est enregistrée.
            </p>
          ) : null}
        </Card>

        <Card className="settings-card">
          <h2>{t("settings.assistant")}</h2>
          <div className="settings-list">
            <div className="settings-row">
              <div>
                <p style={{ fontWeight: 600 }}>{t("settings.autoAnalysis")}</p>
                <p className="muted" style={{ fontSize: "0.88rem" }}>
                  {t("settings.autoAnalysisText")}
                </p>
              </div>
              <button
                type="button"
                className={`switch${settings.autoAnalysis ? " is-on" : ""}`}
                aria-pressed={settings.autoAnalysis}
                aria-label={t("settings.autoAnalysis")}
                onClick={() => toggle("autoAnalysis")}
              />
            </div>

            <div className="settings-row">
              <div>
                <p style={{ fontWeight: 600 }}>{t("settings.replySuggestions")}</p>
                <p className="muted" style={{ fontSize: "0.88rem" }}>
                  {t("settings.replySuggestionsText")}
                </p>
              </div>
              <button
                type="button"
                className={`switch${settings.replySuggestions ? " is-on" : ""}`}
                aria-pressed={settings.replySuggestions}
                aria-label={t("settings.replySuggestions")}
                onClick={() => toggle("replySuggestions")}
              />
            </div>

            <div className="settings-row">
              <div>
                <p style={{ fontWeight: 600 }}>{t("settings.autoClassification")}</p>
                <p className="muted" style={{ fontSize: "0.88rem" }}>
                  {t("settings.autoClassificationText")}
                </p>
              </div>
              <button
                type="button"
                className={`switch${settings.autoClassification ? " is-on" : ""}`}
                aria-pressed={settings.autoClassification}
                aria-label={t("settings.autoClassification")}
                onClick={() => toggle("autoClassification")}
              />
            </div>
          </div>
        </Card>

        <Card className="settings-card">
          <h2>{t("settings.info")}</h2>
          <div className="info-grid">
            <div className="info-row">
              <span className="muted">{t("settings.application")}</span>
              <span style={{ fontWeight: 600 }}>{t("brand.name")}</span>
            </div>
            <div className="info-row">
              <span className="muted">Version</span>
              <span style={{ fontWeight: 600 }}>0.1.0</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
