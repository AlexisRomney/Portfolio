import type { Project } from "@/data/project-types";

/** English project copy for the portfolio. */
export const projectsEn: Project[] = [
  {
    id: "assistant-demandes",
    name: "Automated request handling",
    eyebrow: "Flagship · AI & orchestration",
    summary:
      "A business solution that uses AI to analyze, categorize, prioritize, and route requests from intake through follow-up.",
    problem:
      "Teams waste time manually sorting mixed requests, with unclear priorities and hard-to-track follow-up.",
    solution:
      "Automation pipeline: ingestion, AI analysis, routing, workflows, and error handling, with orchestration and persistence.",
    result:
      "An operational foundation to work faster and more clearly, with traceable business logic rather than interface alone.",
    role: "Product design, architecture, development, AI automation",
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
    demoLabel: "View the demo",
    status: "private-demo",
    published: true,
    featured: true,
    highlight: true,
    visualTone: "ai",
    visuals: [
      {
        src: "/mockups/assistant-demandes-dashboard.webp",
        alt: "AI assistant dashboard: KPIs, categorization, and request routing",
        width: 1024,
        height: 430,
        frame: "browser",
      },
    ],
  },
  {
    id: "optimiseur-windows",
    name: "Windows Optimizer",
    eyebrow: "Technical tool · system",
    summary:
      "A guided desktop app to diagnose, clean, and optimize Windows in a gradual, controlled way.",
    problem:
      "System work is often manual, risky, and inconsistent for technicians and end users alike.",
    solution:
      "Step-by-step WinForms assistant: diagnostics, PowerShell scripts, cleanup, process analysis, restore points, and reporting.",
    result:
      "A structured optimization experience focused on automation, safe execution, and technical UX.",
    role: "UX design, .NET development, system automation",
    technologies: [".NET", "WinForms", "PowerShell", "Windows APIs"],
    demoUrl: null,
    status: "private-demo",
    published: true,
    highlight: true,
    visualTone: "system",
    visuals: [
      {
        src: "/mockups/optimiseur-accueil.webp",
        alt: "Windows Optimizer home screen, guided flow",
        width: 897,
        height: 617,
        frame: "window",
      },
      {
        src: "/mockups/optimiseur-processus.webp",
        alt: "Background process analysis",
        width: 1024,
        height: 512,
        frame: "window",
      },
      {
        src: "/mockups/optimiseur-nettoyage.webp",
        alt: "Windows cleanup step with controlled command",
        width: 1024,
        height: 514,
        frame: "window",
      },
    ],
  },
  {
    id: "memo-etudiant",
    name: "Mémo Étudiant",
    eyebrow: "E-commerce · health",
    summary:
      "Online store for health-study learning resources: memos, sheets, and revision packs.",
    problem:
      "Health students need clear, accessible, structured materials to revise effectively.",
    solution:
      "Dedicated e-commerce platform built for product discovery, conversion, and mobile experience.",
    result:
      "A live public sales channel with a rich catalog and smooth checkout journey.",
    role: "Development & commercial digitalization",
    technologies: ["Web", "E-commerce", "UX"],
    demoUrl: "https://memoetudiant.com/",
    status: "live",
    published: true,
    visualTone: "commerce",
    visuals: [
      {
        src: "/mockups/memo-etudiant-produits.webp",
        alt: "Mémo Étudiant catalog: revision packs and sheets",
        width: 1024,
        height: 458,
        frame: "browser",
      },
    ],
  },
  {
    id: "mailvault",
    name: "Mail2Mine",
    eyebrow: "Product · storage",
    summary:
      "Personal storage tied to a dedicated email address to receive, keep, and find content in one place.",
    problem:
      "Receive, store, and retrieve content without juggling multiple storage services.",
    solution:
      "Send content by email and centralize everything in a personal space available on any device.",
    result:
      "Dedicated email address to a single storage space, accessible from all devices.",
    role: "Product & full-stack development",
    technologies: ["React", "Vite", "Neon", "OAuth", "Gmail API"],
    demoUrl: "http://mail2mine.com",
    status: "live",
    published: true,
    visualTone: "product",
    visuals: [
      {
        src: "/mockups/mailvault-bibliotheque.webp",
        alt: "Mail2Mine library: images, documents, audio, and links",
        width: 1024,
        height: 466,
        frame: "browser",
      },
    ],
  },
  {
    id: "association-afa",
    name: "Association A.F.A.",
    eyebrow: "Institutional site · Réunion Island",
    summary:
      "Digital presence for Act · Train · Support, with animal training and awareness programs.",
    problem:
      "Need for a clear site to present missions, training, and support pathways.",
    solution:
      "Next.js site structured around the three pillars Act / Train / Support, with contact flows.",
    result:
      "A professional, locally rooted showcase ready to welcome and guide visitors.",
    role: "Redesign & web development",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    demoUrl: "https://www.afa.re/",
    status: "live",
    published: true,
    visualTone: "community",
    visuals: [
      {
        src: "/mockups/association-afa-home.webp",
        alt: "A.F.A. association home page, Act, Train, Support",
        width: 1024,
        height: 435,
        frame: "browser",
      },
    ],
  },
  {
    id: "lbc-africa",
    name: "LBC Africa Marketplace",
    eyebrow: "Marketplace · platform",
    summary:
      "Marketplace designed to connect supply and demand in an African context.",
    problem:
      "Build a modern, scalable marketplace experience that can ship quickly.",
    solution:
      "Web marketplace app with catalog journeys and architecture ready for product iteration.",
    result:
      "Product foundation in progress; launch when the official site goes live.",
    role: "Platform development",
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
    name: "Project management tool",
    eyebrow: "Personal project · Agile & Classic",
    summary:
      "Project hub with dashboards, lists, kanban, tasks, and collaboration, still being finalized.",
    problem:
      "Structure project tracking, deadlines, and collaboration around deliverables.",
    solution:
      "Web app with Agile / Classic templates, project management, kanban board, task detail, and admin.",
    result:
      "Visual presentation is ready; public demo coming once the product stabilizes.",
    role: "Product design & development",
    technologies: ["Web", "Kanban", "Project management"],
    demoUrl: null,
    repoUrl: "https://github.com/AlexisRomney/gestion-projet",
    status: "coming-soon",
    published: true,
    visualTone: "product",
    visuals: [
      {
        src: "/mockups/gestion-projet-kanban.webp",
        alt: "Marketplace CA kanban board, stories, to do, test, done",
        width: 1024,
        height: 461,
        frame: "browser",
      },
      {
        src: "/mockups/gestion-projet-accueil.webp",
        alt: "Project manager home, projects and deadlines",
        width: 1024,
        height: 470,
        frame: "browser",
      },
      {
        src: "/mockups/gestion-projet-liste.webp",
        alt: "My projects list, Agile and Classic cards",
        width: 1024,
        height: 460,
        frame: "browser",
      },
      {
        src: "/mockups/gestion-projet-tache.webp",
        alt: "Detailed task view with description and comments",
        width: 1024,
        height: 462,
        frame: "browser",
      },
      {
        src: "/mockups/gestion-projet-edit.webp",
        alt: "Project edit form",
        width: 1024,
        height: 468,
        frame: "browser",
      },
    ],
  },
];
