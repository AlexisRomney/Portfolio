"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type {
  TicketCategory,
  TicketDepartment,
  TicketPriority,
  TicketSentiment,
  TicketStatus,
} from "@gd/types/ticket";
import { en } from "./en";
import { fr, type TranslationKey } from "./fr";

export type Locale = "fr" | "en";
export const LOCALE_STORAGE_KEY = "assistant-ia.locale";

const dictionaries = { fr, en };
const LOCALE_CHANGE_EVENT = "assistant-ia:locale-change";

function subscribeToLocale(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
  };
}

function getLocaleSnapshot(): Locale {
  return localStorage.getItem(LOCALE_STORAGE_KEY) === "fr" ? "fr" : "en";
}

function getServerLocaleSnapshot(): Locale {
  return "en";
}

const ENGLISH_API_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  ["L'analyse IA est temporairement indisponible.", "AI analysis is temporarily unavailable."],
  ["Le routage automatique n'a pas pu être effectué.", "Automatic routing could not be completed."],
  ["Le contrôle automatique n'a pas pu être effectué. Une vérification manuelle est recommandée.", "Automatic control could not be completed. Manual review is recommended."],
  ["La réponse IA n'a pas pu être générée. Réessayez.", "The AI response could not be generated. Try again."],
  ["Impossible de contacter le serveur. Vérifiez votre connexion.", "Unable to contact the server. Check your connection."],
  ["Trop de générations en peu de temps. Réessayez dans quelques instants.", "Too many generations in a short time. Try again shortly."],
  ["Trop de demandes en peu de temps. Réessayez dans quelques instants.", "Too many requests in a short time. Try again shortly."],
  ["Le corps de la requête est invalide.", "The request body is invalid."],
  ["L'état actuel de la demande est invalide.", "The current request state is invalid."],
  ["Données invalides.", "Invalid data."],
  ["Enregistrement impossible.", "Unable to save."],
  ["Impossible de charger", "Unable to load"],
  ["Impossible d'enregistrer", "Unable to save"],
  ["Impossible de modifier", "Unable to update"],
  ["Impossible d'envoyer", "Unable to send"],
  ["Ticket introuvable", "Ticket not found"],
  ["Demande introuvable", "Request not found"],
  ["Erreur interne du serveur", "Internal server error"],
  ["Trop de requêtes", "Too many requests"],
  ["Analyse IA indisponible", "AI analysis unavailable"],
  ["Routage IA indisponible", "AI routing unavailable"],
  ["Réponse IA indisponible", "AI response unavailable"],
  ["Contrôle IA indisponible", "AI control unavailable"],
];

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  translateApiText: (text: string) => string;
  statusLabel: (value: TicketStatus) => string;
  priorityLabel: (value: TicketPriority) => string;
  sentimentLabel: (value: TicketSentiment) => string;
  categoryLabel: (value: TicketCategory) => string;
  departmentLabel: (value: TicketDepartment | string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  // The server snapshot is always English, so hydration starts from identical markup.
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    document.documentElement.lang = nextLocale;
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  }, []);

  useEffect(() => {
    const lang = new URLSearchParams(window.location.search).get("lang");
    if (lang === "fr" || lang === "en") {
      setLocale(lang);
    }
  }, [setLocale]);

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: TranslationKey) => dictionaries[locale][key];
    return {
      locale,
      setLocale,
      t,
      translateApiText: (text) => {
        if (locale === "fr") return text;
        return ENGLISH_API_REPLACEMENTS.reduce(
          (translated, [source, target]) => translated.replaceAll(source, target),
          text,
        );
      },
      statusLabel: (status) => t(`status.${status}`),
      priorityLabel: (priority) => t(`priority.${priority}`),
      sentimentLabel: (sentiment) => t(`sentiment.${sentiment}`),
      categoryLabel: (category) => t(`category.${category}`),
      departmentLabel: (department) => {
        const key = `department.${department}` as TranslationKey;
        return key in dictionaries[locale] ? dictionaries[locale][key] : department;
      },
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside LocaleProvider");
  }
  return value;
}
