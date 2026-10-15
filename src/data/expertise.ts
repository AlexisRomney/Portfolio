/**
 * Offres — deux domaines complémentaires (création web / digitalisation).
 */

export const creationWebOffers = [
  {
    id: "vitrine",
    title: "Sites vitrines",
    description:
      "Présenter clairement une activité, une entreprise ou un service.",
  },
  {
    id: "institutionnel",
    title: "Sites institutionnels",
    description:
      "Créer une présence professionnelle pour une entreprise, une association ou une organisation.",
  },
  {
    id: "ecommerce",
    title: "E-commerce",
    description:
      "Concevoir une boutique en ligne et un parcours d’achat adapté.",
  },
  {
    id: "apps",
    title: "Applications web et métier",
    description:
      "Répondre à des besoins spécifiques avec des outils sur mesure.",
  },
] as const;

export const digitalisationOffers = [
  {
    id: "digitalisation",
    title: "Digitalisation",
    description:
      "Améliorer ou simplifier les processus manuels grâce aux outils numériques.",
  },
  {
    id: "automation",
    title: "Automatisation et workflows",
    description:
      "Connecter les outils et automatiser les tâches répétitives.",
  },
  {
    id: "ai",
    title: "Intelligence artificielle",
    description:
      "Intégrer l’IA uniquement lorsqu’elle apporte une valeur concrète.",
  },
  {
    id: "metier",
    title: "Solutions métier",
    description:
      "Développer des outils adaptés aux contraintes de l’entreprise : applications métier, interfaces avec des ERP existants et solutions sur mesure lorsque le besoin le justifie.",
  },
] as const;

/** @deprecated Utiliser creationWebOffers et digitalisationOffers */
export const automationAiOffers = digitalisationOffers;

/** Ancienne grille d’expertise — conservée pour compatibilité si besoin */
export const expertise = [
  ...creationWebOffers.map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description,
  })),
  ...digitalisationOffers.map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description,
  })),
];
