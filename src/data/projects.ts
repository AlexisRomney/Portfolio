/**
 * Source unique des projets du portfolio.
 * Modifier URLs, titres, descriptions, images et statut ici uniquement.
 *
 * Règle : réalisations publiques uniquement.
 * Aucun code source, secret ou configuration privée des autres repos.
 */

export type ProjectStatus = "live" | "coming-soon" | "private-demo";

export type ProjectVisual = {
  src: string;
  alt: string;
  /** Dimensions natives du fichier — pour conserver le ratio exact */
  width: number;
  height: number;
  /** Cadre de présentation */
  frame?: "browser" | "window" | "plain";
};

export type Project = {
  id: string;
  name: string;
  eyebrow: string;
  summary: string;
  problem: string;
  solution: string;
  result: string;
  role: string;
  technologies: string[];
  /** URL publique de démonstration — null si non disponible */
  demoUrl: string | null;
  /** Libellé du CTA démo (défaut : Voir la démonstration) */
  demoLabel?: string;
  /** Repository GitHub public (optionnel) */
  repoUrl?: string | null;
  status: ProjectStatus;
  /**
   * Visibilité publique. `false` = masqué partout, conservé pour réactivation.
   */
  published: boolean;
  featured?: boolean;
  highlight?: boolean;
  visualTone: "ai" | "product" | "system" | "commerce" | "community";
  /** Captures pour mockups — chemins sous /public */
  visuals: ProjectVisual[];
};

export const projects: Project[] = [
  {
    id: "assistant-demandes",
    name: "Gestion automatisée des demandes",
    eyebrow: "Projet phare · IA & orchestration",
    summary:
      "Solution métier qui analyse, catégorise, priorise et route les demandes grâce à l’IA — de la réception au suivi.",
    problem:
      "Les équipes perdent du temps à trier manuellement des demandes hétérogènes, avec des priorités floues et un suivi difficile.",
    solution:
      "Pipeline d’automatisation : ingestion, analyse IA (catégorie, priorité, sentiment, résumé), routage, workflows et gestion des erreurs — avec orchestration (Trigger.dev) et persistance (Neon).",
    result:
      "Une base opérationnelle pour traiter plus vite, plus clairement, avec une logique métier traçable — pas seulement une interface.",
    role: "Conception produit, architecture, développement, automatisation IA",
    technologies: [
      "Next.js",
      "TypeScript",
      "Gemini",
      "OpenRouter",
      "Neon",
      "Trigger.dev",
      "Resend",
    ],
    demoUrl: "/gestion-demandes",
    demoLabel: "Voir la démonstration",
    status: "private-demo",
    published: true,
    featured: true,
    highlight: true,
    visualTone: "ai",
    visuals: [
      {
        src: "/mockups/assistant-demandes-dashboard.webp",
        alt: "Tableau de bord Assistant IA — KPIs, catégorisation et routage des demandes",
        width: 1024,
        height: 430,
        frame: "browser",
      },
    ],
  },
  {
    id: "optimiseur-windows",
    name: "Optimiseur Windows",
    eyebrow: "Outil technique · système",
    summary:
      "Application desktop guidée pour diagnostiquer, nettoyer et optimiser Windows de façon progressive et contrôlée.",
    problem:
      "Les interventions système sont souvent manuelles, risquées et peu standardisées pour les techniciens comme pour les utilisateurs.",
    solution:
      "Assistant WinForms étape par étape : diagnostic, scripts PowerShell, nettoyage, analyse de processus, points de restauration et reporting.",
    result:
      "Une expérience structurée d’optimisation qui met en avant automatisation, sécurité d’exécution et UX technique.",
    role: "Conception UX, développement .NET, automatisation système",
    technologies: [".NET", "WinForms", "PowerShell", "Windows APIs"],
    demoUrl: null,
    status: "private-demo",
    published: true,
    highlight: true,
    visualTone: "system",
    visuals: [
      {
        src: "/mockups/optimiseur-accueil.webp",
        alt: "Écran d’accueil Optimiseur Windows — parcours guidé",
        width: 897,
        height: 617,
        frame: "window",
      },
      {
        src: "/mockups/optimiseur-processus.webp",
        alt: "Analyse des processus en arrière-plan",
        width: 1024,
        height: 512,
        frame: "window",
      },
      {
        src: "/mockups/optimiseur-nettoyage.webp",
        alt: "Étape de nettoyage Windows avec commande contrôlée",
        width: 1024,
        height: 514,
        frame: "window",
      },
    ],
  },
  {
    id: "memo-etudiant",
    name: "Mémo Étudiant",
    eyebrow: "E-commerce · santé",
    summary:
      "Boutique en ligne de ressources pédagogiques pour les études en santé — mémos, fiches et packs de révision.",
    problem:
      "Les étudiants en santé ont besoin de supports clairs, accessibles et structurés pour réviser efficacement.",
    solution:
      "Plateforme e-commerce dédiée, pensée pour la découverte produit, la conversion et l’expérience mobile.",
    result:
      "Un canal de vente public opérationnel avec catalogue riche et parcours d’achat fluide.",
    role: "Développement & digitalisation commerciale",
    technologies: ["Web", "E-commerce", "UX"],
    demoUrl: "https://memoetudiant.com/",
    status: "live",
    published: true,
    visualTone: "commerce",
    visuals: [
      {
        src: "/mockups/memo-etudiant-produits.webp",
        alt: "Catalogue Mémo Étudiant — packs et fiches de révision",
        width: 1024,
        height: 458,
        frame: "browser",
      },
    ],
  },
  {
    id: "mailvault",
    name: "Mail2Mine",
    eyebrow: "Produit · cloud personnel",
    summary:
      "Envoyer des fichiers à soi-même par e-mail et y accéder partout — boîte mail comme stockage privé.",
    problem:
      "Partager ou retrouver rapidement des fichiers sans multiplier les services de stockage dédiés.",
    solution:
      "Application web avec authentification OAuth, accès multi-appareils et architecture centrée sur la boîte mail.",
    result:
      "Un produit simple à comprendre : inbox = stockage, accessible depuis n’importe quel appareil.",
    role: "Produit & développement full-stack",
    technologies: ["React", "Vite", "Neon", "OAuth", "Gmail API"],
    demoUrl: "http://mail2mine.com",
    status: "live",
    /** Masqué temporairement du portfolio public — code / assets conservés */
    published: false,
    visualTone: "product",
    visuals: [
      {
        src: "/mockups/mailvault-bibliotheque.webp",
        alt: "Bibliothèque Mail2Mine — images, documents, audio et liens",
        width: 1024,
        height: 466,
        frame: "browser",
      },
    ],
  },
  {
    id: "association-afa",
    name: "Association A.F.A.",
    eyebrow: "Site institutionnel · La Réunion",
    summary:
      "Présence digitale pour Agir · Former · Accompagner — formations animalières et sensibilisation.",
    problem:
      "Besoin d’un site clair pour présenter les missions, formations et parcours d’accompagnement.",
    solution:
      "Site Next.js structuré autour des trois piliers Agir / Former / Accompagner, avec parcours de contact.",
    result:
      "Une vitrine professionnelle ancrée localement, prête à accueillir et orienter les publics.",
    role: "Refonte & développement web",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    demoUrl: "https://www.afa.re/",
    status: "live",
    published: true,
    visualTone: "community",
    visuals: [
      {
        src: "/mockups/association-afa-home.webp",
        alt: "Page d’accueil Association A.F.A. — Agir, Former, Accompagner",
        width: 1024,
        height: 435,
        frame: "browser",
      },
    ],
  },
  {
    id: "lbc-africa",
    name: "LBC Africa Marketplace",
    eyebrow: "Marketplace · plateforme",
    summary:
      "Marketplace pensée pour connecter offre et demande dans un contexte africain.",
    problem:
      "Créer une expérience de marketplace moderne, scalable et déployable rapidement.",
    solution:
      "Application web marketplace avec parcours catalogue et architecture prête pour itérations produit.",
    result:
      "Base produit en préparation — publication dès mise en ligne officielle.",
    role: "Développement plateforme",
    technologies: ["Web", "Marketplace"],
    demoUrl: null,
    status: "coming-soon",
    /** Masqué tant que le site n’est pas en ligne — passer à true pour réactiver */
    published: false,
    visualTone: "commerce",
    visuals: [],
  },
  {
    id: "gestion-projet",
    name: "Outil de gestion de projet",
    eyebrow: "Projet personnel · Agile & Classique",
    summary:
      "Espace de pilotage projets : tableaux de bord, listes, kanban, tâches et collaboration — en cours de finalisation.",
    problem:
      "Structurer le suivi de projets, les échéances et la collaboration autour des livrables.",
    solution:
      "Application web avec modèles Agile / Classique, gestion des projets, board kanban, fiches tâches et administration.",
    result:
      "Présentation visuelle déjà prête ; démonstration publique à venir lorsque le produit sera stabilisé.",
    role: "Conception produit & développement",
    technologies: ["Web", "Kanban", "Gestion de projet"],
    demoUrl: null,
    repoUrl: "https://github.com/AlexisRomney/gestion-projet",
    status: "coming-soon",
    published: true,
    visualTone: "product",
    visuals: [
      {
        src: "/mockups/gestion-projet-accueil.webp",
        alt: "Accueil Gestionnaire de projet — projets et échéances",
        width: 1024,
        height: 470,
        frame: "browser",
      },
      {
        src: "/mockups/gestion-projet-liste.webp",
        alt: "Liste Mes projets — cartes Agile et Classique",
        width: 1024,
        height: 460,
        frame: "browser",
      },
      {
        src: "/mockups/gestion-projet-kanban.webp",
        alt: "Board kanban Marketplace CA — stories, to do, test, done",
        width: 1024,
        height: 461,
        frame: "browser",
      },
      {
        src: "/mockups/gestion-projet-tache.webp",
        alt: "Fiche tâche détaillée avec description et commentaires",
        width: 1024,
        height: 462,
        frame: "browser",
      },
      {
        src: "/mockups/gestion-projet-edit.webp",
        alt: "Formulaire de modification d’un projet",
        width: 1024,
        height: 468,
        frame: "browser",
      },
    ],
  },
];

export function getPublishedProjects() {
  return projects.filter((p) => p.published);
}

export function getProject(id: string) {
  return getPublishedProjects().find((p) => p.id === id);
}

/** Accès brut (y compris non publiés) — pour maintenance / réactivation */
export function getProjectRaw(id: string) {
  return projects.find((p) => p.id === id);
}

export function getFeaturedProject() {
  return getPublishedProjects().find((p) => p.featured);
}

export function getHighlightedProjects() {
  return getPublishedProjects().filter((p) => p.highlight);
}

export function getShowcaseProjects() {
  return getPublishedProjects().filter(
    (p) =>
      !p.featured &&
      p.id !== "gestion-projet" &&
      p.id !== "optimiseur-windows",
  );
}

export function getComingSoonProjects() {
  return getPublishedProjects().filter((p) => p.id === "gestion-projet");
}
