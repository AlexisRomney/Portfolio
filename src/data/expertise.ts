export const expertise = [
  {
    id: "digitalisation",
    title: "Digitalisation",
    description:
      "Transformer des processus manuels en parcours numériques clairs, mesurables et adoptables par les équipes.",
  },
  {
    id: "automation",
    title: "Automatisation",
    description:
      "Orchestrer workflows, intégrations et traitements pour éliminer les tâches répétitives sans perdre le contrôle métier.",
  },
  {
    id: "ai",
    title: "Intelligence artificielle",
    description:
      "Intégrer l’IA là où elle crée de la valeur : analyse, catégorisation, priorisation, synthèse et aide à la décision.",
  },
  {
    id: "business-tools",
    title: "Outils métier",
    description:
      "Concevoir et développer des applications adaptées aux opérations réelles — pas des démos décoratives.",
  },
  {
    id: "project",
    title: "Gestion de projet IT",
    description:
      "Structurer le besoin, prioriser, livrer par itérations et aligner technique et enjeux business.",
  },
  {
    id: "process",
    title: "Analyse & optimisation",
    description:
      "Cartographier les flux, identifier les frictions et proposer des leviers concrets de performance.",
  },
] as const;

export const techStack = [
  {
    group: "Frontend",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  },
  {
    group: "Backend & data",
    items: ["Node.js", "PostgreSQL / Neon", "API REST"],
  },
  {
    group: "IA & automation",
    items: ["Gemini", "OpenRouter", "Trigger.dev", "Workflows"],
  },
  {
    group: "Plateforme & desktop",
    items: [".NET / WinForms", "PowerShell", "Vercel"],
  },
] as const;
