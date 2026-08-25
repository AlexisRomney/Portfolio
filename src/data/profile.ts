/**
 * Parcours professionnel — uniquement des éléments publics vérifiables.
 * Ne pas inventer d’expérience, diplôme ou responsabilité.
 */

export const profile = {
  name: "Alexis Romney",
  role: "Chef de Projet IT / Business Analyst · Digitalisation · Automatisation · IA",
  tagline:
    "Je transforme les besoins métier en solutions numériques automatisées, intelligentes et déployables.",
  shortBio:
    "Consultant et développeur orienté impact : comprendre le processus, concevoir l’outil, automatiser les flux, intégrer l’IA, puis livrer.",
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

export type JourneyItem = {
  kind: "formation" | "experience" | "evolution" | "projects";
  title: string;
  period: string;
  org?: string;
  description: string;
};

export const journey: JourneyItem[] = [
  {
    kind: "formation",
    title: "Master — Computer Engineering",
    period: "2015 — 2020",
    org: "SUPINFO International University",
    description:
      "Formation d’ingénierie informatique : bases solides pour concevoir, développer et faire évoluer des systèmes d’information.",
  },
  {
    kind: "experience",
    title: "Développement & systèmes d’information",
    period: "2020 — 2023",
    description:
      "Parcours en développement d’applications et environnements SI (notamment Alteca, Air France Fast Track, Omnisoft) — du code aux usages métier.",
  },
  {
    kind: "experience",
    title: "Processus, formation & coordination IT",
    period: "2023 — aujourd’hui",
    org: "Groupe GHANTY · Saint-Louis, La Réunion",
    description:
      "Coordination de projets IT et formation sur les process : Chargé de processus et de formation, puis Assistant de projet Méthodes et Process.",
  },
  {
    kind: "evolution",
    title: "Digitalisation · Automatisation · IA appliquée",
    period: "Aujourd’hui",
    description:
      "Évolution naturelle vers des solutions qui digitalisent les processus métiers : analyse des demandes, orchestration, automatisation et IA utile au quotidien.",
  },
  {
    kind: "projects",
    title: "Projets personnels & livrables",
    period: "Continu",
    description:
      "Applications web, outils métier, optimisation système et expérimentations IA — du besoin métier à la mise en production.",
  },
];
