/**
 * Positionnement dual — Création Web OU Automatisation & IA (indépendants, combinables si besoin).
 */

export const creationWebOffers = [
  {
    id: "vitrine",
    title: "Sites vitrines",
    description:
      "Présenter une activité, une entreprise ou un service avec clarté et impact.",
  },
  {
    id: "institutionnel",
    title: "Sites institutionnels",
    description:
      "Une présence web professionnelle pour associations, entreprises et organisations.",
  },
  {
    id: "ecommerce",
    title: "E-commerce",
    description: "Vendre des produits ou services en ligne avec un parcours fluide.",
  },
  {
    id: "apps",
    title: "Applications web / métier",
    description:
      "Répondre à des besoins spécifiques avec des outils numériques sur mesure.",
  },
] as const;

export const automationAiOffers = [
  {
    id: "automation",
    title: "Automatisation",
    description: "Automatiser les tâches et processus répétitifs.",
  },
  {
    id: "ai",
    title: "Intelligence artificielle",
    description: "Intégrer l’IA dans des usages professionnels concrets.",
  },
  {
    id: "digitalisation",
    title: "Digitalisation",
    description:
      "Remplacer ou améliorer des processus manuels grâce aux outils numériques.",
  },
  {
    id: "metier",
    title: "Solutions métier",
    description: "Créer des outils adaptés aux besoins spécifiques d’une entreprise.",
  },
  {
    id: "workflows",
    title: "Workflows",
    description:
      "Connecter les outils et automatiser les étapes d’un processus.",
  },
] as const;

/** Ancienne grille d’expertise — conservée pour compatibilité si besoin */
export const expertise = [
  ...creationWebOffers.map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description,
  })),
  ...automationAiOffers.map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description,
  })),
];
