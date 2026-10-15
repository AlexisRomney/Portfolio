import { resolveContactUiLocale, type ContactUiLocale } from "@/lib/contact/contact-ui-copy";

export type HeroLocale = ContactUiLocale;

export function resolveHeroLocale(lang: string | undefined): HeroLocale {
  return resolveContactUiLocale(lang);
}

export const heroCopy = {
  fr: {
    mainIntro:
      "J’accompagne les professionnels et les entreprises de l’analyse du besoin à la mise en production, en France et à l’international, pour leurs projets de création de sites web, de digitalisation et d’amélioration de leurs processus métier.",
    complement:
      "Disponible pour des missions ponctuelles ou des projets plus structurés, avec une approche claire et sans jargon inutile.",
    asideBullets: [
      "Site vitrine, institutionnel ou e-commerce",
      "Refonte de site internet existant",
      "Solutions numériques sur mesure",
      "Automatisations IA pour faciliter votre quotidien",
    ],
    availability: "Ouvert aux missions",
  },
  en: {
    mainIntro:
      "I support professionals and businesses from needs analysis through to production, in France and internationally, on new or redesigned websites, e-commerce, and business tools tailored to their needs.",
    complement:
      "Available for one-off assignments or longer projects, with a clear approach and no unnecessary jargon.",
    asideBullets: [
      "Showcase, institutional or e-commerce websites",
      "Redesign of an existing website",
      "Custom digital solutions",
      "AI automations to simplify your day-to-day",
    ],
    availability: "Open to projects",
  },
} as const;
