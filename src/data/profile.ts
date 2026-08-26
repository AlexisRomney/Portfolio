/**
 * Parcours — source : CV (ne pas inventer dates, entreprises, missions).
 */

export const profile = {
  name: "Alexis Romney",
  role: "Création Web · Automatisation · IA",
  tagline:
    "Je construis la solution adaptée à votre besoin — d’un site web simple à une solution numérique plus avancée.",
  shortBio:
    "Site vitrine, e-commerce, application, automatisation ou IA : chaque projet part du besoin réel, avec uniquement ce qui apporte de la valeur.",
  location: "La Réunion · France",
  availability: "Ouvert aux missions",
  /**
   * Photo de profil (optionnelle).
   * Placer le fichier dans `public/brand/profile.jpg` puis renseigner le chemin.
   */
  photo: "" as string,
  email: "" as string,
  github: "https://github.com/AlexisRomney",
  githubOrigin: "" as string,
  linkedin: "https://www.linkedin.com/in/alexis-romney/",
} as const;

export type JourneyEmphasis = "featured" | "compact";

export type JourneyExperience = {
  id: string;
  title: string;
  org: string;
  place: string;
  period: string;
  emphasis: JourneyEmphasis;
  /** Accroche courte fidèle au CV */
  summary: string;
  /** Points clés issus du CV */
  highlights: string[];
};

export type JourneyEducation = {
  id: string;
  title: string;
  org: string;
  period: string;
};

/** Expériences — ordre du plus récent au plus ancien */
export const journeyExperiences: JourneyExperience[] = [
  {
    id: "auto-entrepreneur",
    title: "Création Web & Solutions numériques sur mesure",
    org: "Auto-entrepreneur",
    place: "Saint-Joseph, Réunion",
    period: "Depuis mars 2026",
    emphasis: "featured",
    summary:
      "Du site vitrine à la solution métier sur mesure, je conçois des outils adaptés à vos besoins — avec la possibilité d’aller plus loin via l’automatisation et l’IA lorsque cela apporte une réelle valeur.",
    highlights: [
      "Recueil des besoins, analyse fonctionnelle et spécifications",
      "Sites vitrines, applications métier et solutions web sur mesure",
      "Automatisation et IA lorsque le besoin le justifie",
      "Déploiement cloud, formation utilisateurs et suivi jusqu’à la mise en production",
    ],
  },
  {
    id: "ghanty",
    title: "Coordinateur Applicatif et Processus Métiers",
    org: "Ghanty",
    place: "Saint-Louis, Réunion",
    period: "Août 2021 → octobre 2024",
    emphasis: "featured",
    summary:
      "Interface entre métiers et prestataires : recettes UAT, support applicatif, e-commerce / ERP, formation au changement et optimisation des processus.",
    highlights: [
      "Pilotage des recettes fonctionnelles (UAT) et mises en production",
      "Gestion des incidents, support utilisateurs et tickets applicatifs",
      "Référent IT E-commerce — intégration articles et commandes via ERP",
      "Analyse fonctionnelle, cahiers des charges et cartographie des processus",
    ],
  },
  {
    id: "alteca",
    title: "Développeur Web et d’applications",
    org: "ALTECA",
    place: "Toulouse, France",
    period: "Juin 2020 → octobre 2020",
    emphasis: "compact",
    summary:
      "Conception et développement d’une application de gestion de projet interne, environnement DevOps et méthodes Agile / Scrum.",
    highlights: [
      "Conception et développement d’une application de gestion de projet interne",
      "Mise en place d’un environnement DevOps",
      "Participation aux méthodes Agile / Scrum",
    ],
  },
  {
    id: "air-france",
    title: "Développeur d’applications",
    org: "Air France",
    place: "Toulouse, France",
    period: "Juillet 2019 → octobre 2019",
    emphasis: "compact",
    summary:
      "Migration d’un projet Web App d’Ionic vers Angular et pratiques Agile / Scrum.",
    highlights: [
      "Migration d’un projet Web App d’Ionic vers Angular",
      "Participation aux pratiques Agile / Scrum",
    ],
  },
  {
    id: "summer-school",
    title: "Gestionnaire IT",
    org: "Summer School Beijing",
    place: "Beijing, Chine",
    period: "Juillet 2018 → septembre 2018",
    emphasis: "compact",
    summary: "Gestion des ressources IT et réalisation de contenus audiovisuels.",
    highlights: [
      "Gestion des ressources IT",
      "Réalisation de contenus audiovisuels",
    ],
  },
  {
    id: "run-affutage",
    title: "Développeur Web",
    org: "Run Affutage",
    place: "Saint-Denis, Réunion",
    period: "Août 2017 → octobre 2017",
    emphasis: "compact",
    summary:
      "Création d’un site web e-commerce et contribution à la stratégie de visibilité en ligne.",
    highlights: [
      "Création d’un site web e-commerce",
      "Contribution à la stratégie de visibilité en ligne",
    ],
  },
  {
    id: "omnisoft",
    title: "Développeur Web PHP",
    org: "Omnisoft",
    place: "Saint-Louis, Réunion",
    period: "Août 2016 → octobre 2016",
    emphasis: "compact",
    summary:
      "Interface Intranet pour l’enregistrement des appels clients, bases de données et approche des ERP médicaux AxiSanté.",
    highlights: [
      "Création d’une interface Intranet pour l’enregistrement des appels clients",
      "Mise en ordre des bases de données",
      "Approche des ERP médicaux AxiSanté 4 et 5",
    ],
  },
];

export const journeyEducation: JourneyEducation[] = [
  {
    id: "ifr",
    title: "Master Manager de la Communication & Stratégie digitale",
    org: "IFR",
    period: "Septembre 2021 → août 2022",
  },
  {
    id: "supinfo",
    title: "Master of Science 2 — Expert en Informatique",
    org: "Supinfo",
    period: "Novembre 2015 → novembre 2020",
  },
];
