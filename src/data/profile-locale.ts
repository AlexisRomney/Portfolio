import type { Locale } from "@/i18n/config";
import {
  journeyEducation as journeyEducationFr,
  journeyExperiences as journeyExperiencesFr,
  profile as profileBase,
  type JourneyEducation,
  type JourneyExperience,
} from "@/data/profile";

/** Accroche Hero + footer (EN) — source unique pour éviter les divergences. */
export const EN_ACCENT_TAGLINE = "Digitalization · Digital solutions · Automation";

export type LocalizedProfile = {
  role: string;
  tagline: string;
  location: string;
  availability: string;
  footerTagline: string;
};

const profileStrings: Record<Locale, LocalizedProfile> = {
  fr: {
    role: profileBase.role,
    tagline: profileBase.tagline,
    location: profileBase.location,
    availability: profileBase.availability,
    footerTagline: "Création Web · Solutions numériques · Automatisation",
  },
  en: {
    role: EN_ACCENT_TAGLINE,
    tagline:
      "From needs analysis through production, in France and internationally.",
    location: "Réunion Island · France",
    availability: "Open to projects",
    footerTagline: EN_ACCENT_TAGLINE,
  },
};

const journeyExperiencesEn: JourneyExperience[] = [
  {
    id: "auto-entrepreneur",
    title: "Web & custom digital solutions",
    org: "Self-employed",
    place: "Saint-Joseph, Réunion",
    period: "Since March 2026",
    emphasis: "featured",
    summary:
      "From showcase sites to custom business tools, I design solutions adapted to your needs, with automation and AI when they add real value.",
    highlights: [
      "Requirements gathering, functional analysis, and specifications",
      "Showcase sites, business apps, and custom web solutions",
      "Automation and AI when the need justifies it",
      "Cloud deployment, user training, and support through go-live",
    ],
  },
  {
    id: "ghanty",
    title: "Application & business process coordinator",
    org: "Ghanty",
    place: "Saint-Louis, Réunion",
    period: "August 2021 → October 2024",
    emphasis: "featured",
    summary:
      "Bridge between business teams and vendors: UAT, application support, e-commerce / ERP, change management, and process optimization.",
    highlights: [
      "Functional testing (UAT) and production releases",
      "Incident management, user support, and application tickets",
      "E-commerce IT lead: product and order integration via ERP",
      "Functional analysis, specifications, and process mapping",
    ],
  },
  {
    id: "alteca",
    title: "Web & application developer",
    org: "ALTECA",
    place: "Toulouse, France",
    period: "June 2020 → October 2020",
    emphasis: "compact",
    summary:
      "Design and development of an internal project management app, DevOps environment, and Agile / Scrum practices.",
    highlights: [
      "Design and development of an internal project management application",
      "DevOps environment setup",
      "Participation in Agile / Scrum methods",
    ],
  },
  {
    id: "air-france",
    title: "Application developer",
    org: "Air France",
    place: "Toulouse, France",
    period: "July 2019 → October 2019",
    emphasis: "compact",
    summary: "Migration of an Ionic web app to Angular and Agile / Scrum practices.",
    highlights: [
      "Migration of an Ionic web app project to Angular",
      "Participation in Agile / Scrum practices",
    ],
  },
  {
    id: "summer-school",
    title: "IT manager",
    org: "Summer School Beijing",
    place: "Beijing, China",
    period: "July 2018 → September 2018",
    emphasis: "compact",
    summary: "IT resource management and audiovisual content production.",
    highlights: ["IT resource management", "Audiovisual content production"],
  },
  {
    id: "run-affutage",
    title: "Web developer",
    org: "Run Affutage",
    place: "Saint-Denis, Réunion",
    period: "August 2017 → October 2017",
    emphasis: "compact",
    summary: "E-commerce website and contribution to online visibility strategy.",
    highlights: [
      "E-commerce website development",
      "Contribution to online visibility strategy",
    ],
  },
  {
    id: "omnisoft",
    title: "PHP web developer",
    org: "Omnisoft",
    place: "Saint-Louis, Réunion",
    period: "August 2016 → October 2016",
    emphasis: "compact",
    summary:
      "Intranet interface for logging client calls, database cleanup, and exposure to AxiSanté medical ERP.",
    highlights: [
      "Intranet interface for logging client calls",
      "Database cleanup",
      "Introduction to AxiSanté medical ERP 4 and 5",
    ],
  },
];

const journeyEducationEn: JourneyEducation[] = [
  {
    id: "ifr",
    title: "Master in Communication Management & Digital Strategy",
    org: "IFR",
    period: "September 2021 → August 2022",
  },
  {
    id: "supinfo",
    title: "Master of Science 2, Computer Science Expert",
    org: "Supinfo",
    period: "November 2015 → November 2020",
  },
];

export function getLocalizedProfile(locale: Locale): LocalizedProfile {
  return profileStrings[locale];
}

export function getJourneyExperiences(locale: Locale): JourneyExperience[] {
  return locale === "en" ? journeyExperiencesEn : journeyExperiencesFr;
}

export function getJourneyEducation(locale: Locale): JourneyEducation[] {
  return locale === "en" ? journeyEducationEn : journeyEducationFr;
}
