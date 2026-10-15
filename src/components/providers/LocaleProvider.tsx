"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { getPortfolioDictionary, type PortfolioDictionary } from "@/i18n/portfolio-dictionary";

type LocaleContextValue = {
  locale: Locale;
  dict: PortfolioDictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const dict = getPortfolioDictionary(locale);
  return (
    <LocaleContext.Provider value={{ locale, dict }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx.locale;
}

export function usePortfolioDictionary(): PortfolioDictionary {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("usePortfolioDictionary must be used within LocaleProvider");
  }
  return ctx.dict;
}
