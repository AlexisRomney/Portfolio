export const profile = {
  name: "Alexis Romney",
  role: "Digitalisation · Automatisation · IA",
  tagline:
    "Je transforme les besoins métier en solutions numériques automatisées, intelligentes et déployables.",
  shortBio:
    "Consultant et développeur orienté impact : comprendre le processus, concevoir l’outil, automatiser les flux, intégrer l’IA, puis livrer.",
  location: "France",
  availability: "Ouvert aux missions",
  /**
   * Photo de profil (optionnelle).
   * Placer le fichier dans `public/brand/profile.jpg` puis renseigner le chemin.
   * Formats recommandés : JPG/WebP, 800×800 minimum, visage centré, fond neutre.
   */
  photo: "" as string,
  /** Mettre à jour ici — une seule source pour le CTA contact mailto de secours */
  email: "" as string,
  github: "https://github.com/AlexisRomney",
  /**
   * Lien vers le projet / repository Origin.
   * Laisser vide tant que l’URL réelle n’est pas connue — ne pas inventer.
   */
  githubOrigin: "" as string,
  linkedin: "https://www.linkedin.com/in/alexis-romney/",
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
