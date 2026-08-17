/**
 * Source unique des projets du portfolio.
 * Modifier les URLs ici uniquement — jamais en dur dans les composants.
 *
 * Règle : ce fichier décrit des réalisations publiques.
 * Aucun code source, secret ou configuration privée des autres repos.
 */

export type ProjectStatus = "live" | "coming-soon" | "private-demo";

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
  status: ProjectStatus;
  featured?: boolean;
  highlight?: boolean;
  visualTone: "ai" | "product" | "system" | "commerce" | "community";
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
    demoUrl: null,
    status: "coming-soon",
    featured: true,
    highlight: true,
    visualTone: "ai",
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
    highlight: true,
    visualTone: "system",
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
    visualTone: "commerce",
  },
  {
    id: "mailvault",
    name: "MailVault",
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
    demoUrl: "https://mailvault-your-personal-cloud.vercel.app/",
    status: "live",
    visualTone: "product",
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
    demoUrl: "https://association-afa.vercel.app/",
    status: "live",
    visualTone: "community",
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
      "Base produit déployée, évolutive selon les retours marché.",
    role: "Développement plateforme",
    technologies: ["Web", "Marketplace", "Vercel"],
    demoUrl: "https://vercel.com/alexis-romney/lbc-africa-marketplace",
    status: "live",
    visualTone: "commerce",
  },
  {
    id: "gestion-projet",
    name: "Outil de gestion de projet",
    eyebrow: "Prochainement",
    summary:
      "Espace réservé pour présenter un outil de gestion de projet — captures, stack et démo à venir.",
    problem:
      "Structurer le suivi de projets et la collaboration autour des livrables.",
    solution:
      "Présentation en cours de préparation. Screenshots, technologies et lien de démonstration seront ajoutés ici.",
    result: "Section prête à accueillir le contenu dès que le produit est présentable.",
    role: "Conception & développement",
    technologies: ["À venir"],
    demoUrl: null,
    status: "coming-soon",
    visualTone: "product",
  },
];

export function getProject(id: string) {
  return projects.find((p) => p.id === id);
}

export function getFeaturedProject() {
  return projects.find((p) => p.featured);
}

export function getHighlightedProjects() {
  return projects.filter((p) => p.highlight);
}

export function getShowcaseProjects() {
  return projects.filter(
    (p) => !p.featured && p.id !== "gestion-projet" && p.id !== "optimiseur-windows",
  );
}

export function getComingSoonProjects() {
  return projects.filter((p) => p.id === "gestion-projet");
}
