"use client";

import { Fragment } from "react";
import { useI18n, type Locale } from "@gd/i18n";

const OPTIONS = [
  { value: "fr", nameKey: "language.fr" },
  { value: "en", nameKey: "language.en" },
] as const satisfies ReadonlyArray<{ value: Locale; nameKey: "language.fr" | "language.en" }>;

export function LocaleSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={`locale-selector${compact ? " is-compact" : ""}`}
      role="group"
      aria-label={t("language.label")}
    >
      {OPTIONS.map((option, index) => {
        const active = locale === option.value;
        return (
          <Fragment key={option.value}>
            {index > 0 ? (
              <span className="locale-selector-separator" aria-hidden>
                |
              </span>
            ) : null}
            <button
              type="button"
              className={`locale-selector-option${active ? " is-active" : ""}`}
              aria-pressed={active}
              title={t(option.nameKey)}
              onClick={() => setLocale(option.value)}
            >
              {option.value.toUpperCase()}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
