export const profile = {
  name: "Alexis Romney",
  role: "Digitalisation · Automatisation · IA",
  tagline:
    "Je transforme les besoins métier en solutions numériques automatisées, intelligentes et déployables.",
  shortBio:
    "Consultant et développeur orienté impact : comprendre le processus, concevoir l’outil, automatiser les flux, intégrer l’IA, puis livrer.",
  location: "France",
  availability: "Ouvert aux missions",
  /** Mettre à jour ici — une seule source pour le CTA contact */
  email: "" as string,
  github: "https://github.com/AlexisRomney",
  githubPortfolio: "https://github.com/AlexisRomney/Portfolio",
  linkedin: "" as string,
} as const;

export const journey = [
  {
    title: "Solutions métier & automatisation",
    period: "Aujourd’hui",
    description:
      "Conception et développement d’outils qui digitalisent les processus : analyse des demandes, orchestration, IA et déploiement.",
  },
  {
    title: "Produits numériques & plateformes",
    period: "Récent",
    description:
      "Applications web orientées usage réel — e-commerce, association, stockage intelligent — du besoin à la mise en ligne.",
  },
  {
    title: "Outils techniques & optimisation",
    period: "Continu",
    description:
      "Automatisation système, scripts, diagnostic et expérience utilisateur pour améliorer les performances au quotidien.",
  },
] as const;
