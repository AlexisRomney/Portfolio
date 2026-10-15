import type { Locale } from "@/i18n/config";
import {
  creationWebOffers as creationWebOffersFr,
  digitalisationOffers as digitalisationOffersFr,
} from "@/data/expertise";

export type ExpertiseOffer = {
  id: string;
  title: string;
  description: string;
};

const creationWebOffersEn: ExpertiseOffer[] = [
  {
    id: "vitrine",
    title: "Showcase websites",
    description: "Present an activity, business, or service clearly.",
  },
  {
    id: "institutionnel",
    title: "Institutional websites",
    description:
      "Build a professional presence for a company, association, or organization.",
  },
  {
    id: "ecommerce",
    title: "E-commerce",
    description: "Design an online store and a purchase journey that fits.",
  },
  {
    id: "apps",
    title: "Web & business applications",
    description: "Address specific needs with custom tools.",
  },
];

const digitalisationOffersEn: ExpertiseOffer[] = [
  {
    id: "digitalisation",
    title: "Digitalization",
    description: "Improve or simplify manual processes with digital tools.",
  },
  {
    id: "automation",
    title: "Automation & workflows",
    description: "Connect tools and automate repetitive tasks.",
  },
  {
    id: "ai",
    title: "Artificial intelligence",
    description: "Add AI only when it delivers concrete value.",
  },
  {
    id: "metier",
    title: "Business solutions",
    description:
      "Build tools aligned with company constraints: business apps, ERP interfaces, and custom solutions when justified.",
  },
];

export function getCreationWebOffers(locale: Locale): ExpertiseOffer[] {
  return locale === "en" ? creationWebOffersEn : [...creationWebOffersFr];
}

export function getDigitalisationOffers(locale: Locale): ExpertiseOffer[] {
  return locale === "en" ? digitalisationOffersEn : [...digitalisationOffersFr];
}
