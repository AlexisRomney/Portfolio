export type ContactUiLocale = "fr" | "en";

export function resolveContactUiLocale(lang: string | undefined): ContactUiLocale {
  return lang?.toLowerCase().startsWith("en") ? "en" : "fr";
}

/** Libellés nav + section contact (portfolio), hors champs du formulaire */
export const contactUiCopy = {
  fr: {
    navCta: "Contact",
    intro:
      "Une question ou un projet ? Vous pouvez aussi me contacter pour demander un devis. Décrivez votre besoin et je vous répondrai directement par e-mail.",
    modalIntro:
      "Décrivez votre besoin et je vous répondrai directement par e-mail.",
    primaryCta: "Me contacter",
  },
  en: {
    navCta: "Contact",
    intro:
      "Have a question or a project in mind? You can also contact me for a quote. Tell me about your needs and I will reply directly by email.",
    modalIntro:
      "Tell me about your needs and I will reply directly by email.",
    primaryCta: "Contact me",
  },
} as const;
