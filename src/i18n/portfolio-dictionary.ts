import { EN_ACCENT_TAGLINE } from "@/data/profile-locale";
import type { Locale } from "@/i18n/config";

export type PortfolioDictionary = {
  seo: {
    title: string;
    description: string;
    h1: string;
    keywords: string[];
    websiteName: string;
    ogImageAlt: string;
  };
  a11y: {
    skipToContent: string;
    mainNav: string;
    mobileNav: string;
    openMenu: string;
    closeMenu: string;
    menu: string;
  };
  lang: {
    switchLabel: string;
    fr: string;
    en: string;
  };
  nav: {
    expertise: string;
    projects: string;
    journey: string;
    contact: string;
  };
  hero: {
    mainIntro: string;
    complement: string;
    asideBullets: string[];
    availability: string;
    ctaProject: string;
    ctaProjects: string;
  };
  expertise: {
    eyebrow: string;
    title: string;
    description: string;
    columnWeb: string;
    columnDigital: string;
  };
  projects: {
    eyebrow: string;
    title: string;
    description: string;
    problem: string;
    solution: string;
    viewProject: string;
    linkSoon: string;
  };
  featuredAi: {
    pipelineAria: string;
    pipelineSteps: string[];
    problem: string;
    solution: string;
    result: string;
    demoEyebrow: string;
    demoTitle: string;
    demoBody: string;
    demoCta: string;
    role: string;
  };
  windowsOptimizer: {
    problem: string;
    solution: string;
    capabilities: string;
    capabilitiesList: string[];
    galleryLabel: string;
    footnote: string;
  };
  projectManagement: {
    problem: string;
    solution: string;
    status: string;
    githubCta: string;
    galleryLabel: string;
  };
  journey: {
    eyebrow: string;
    title: string;
    description: string;
    earlyEyebrow: string;
    earlyTitle: string;
    earlyBody: string;
    educationEyebrow: string;
    educationTitle: string;
    featuredToday: string;
    featuredKey: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    intro: string;
    modalIntro: string;
    primaryCta: string;
    navCta: string;
    closeDialog: string;
    close: string;
    successTitle: string;
    successBody: string;
    cancel: string;
    submit: string;
    submitting: string;
    serverError: string;
    fields: {
      name: string;
      email: string;
      subject: string;
      message: string;
    };
    validation: {
      invalidData: string;
      formCheck: string;
      name: string;
      email: string;
      subject: string;
      message: string;
    };
  };
  footer: {
    tagline: string;
  };
  labels: {
    problem: string;
    solution: string;
    result: string;
  };
  mockups: {
    frameWindow: string;
    frameBrowser: string;
    carouselDefaultLabel: string;
    prevImage: string;
    nextImage: string;
    slideIndicators: string;
    goToImage: (index: number) => string;
    slideOf: (current: number, total: number) => string;
  };
  notFound: {
    title: string;
    back: string;
  };
  profile: {
    portraitAlt: (name: string) => string;
  };
  contactApi: {
    genericError: string;
  };
};

const fr: PortfolioDictionary = {
  seo: {
    title: "Solutions numériques & digitalisation | Alexis Romney",
    description:
      "Conception de solutions numériques pour les entreprises : digitalisation, sites vitrines et institutionnels, e-commerce, applications et automatisation lorsque le besoin métier le justifie.",
    h1: "Développement de solutions sur mesure",
    keywords: [
      "solutions numériques",
      "digitalisation des entreprises",
      "conception de solutions numériques",
      "automatisation des processus",
      "création de site vitrine",
      "site institutionnel",
      "e-commerce sur mesure",
      "applications métier",
      "intelligence artificielle",
      "Alexis Romney",
    ],
    websiteName: "Alexis Romney · Portfolio",
    ogImageAlt:
      "Alexis Romney — développement de solutions sur mesure, digitalisation et automatisation",
  },
  a11y: {
    skipToContent: "Aller au contenu",
    mainNav: "Principale",
    mobileNav: "Mobile",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    menu: "Menu",
  },
  lang: {
    switchLabel: "Langue",
    fr: "FR",
    en: "EN",
  },
  nav: {
    expertise: "Expertise",
    projects: "Réalisations",
    journey: "Parcours",
    contact: "Contact",
  },
  hero: {
    mainIntro:
      "J’accompagne les professionnels et les entreprises de l’analyse du besoin à la mise en production, en France et à l’international, pour leurs projets de création de sites web, de digitalisation et d’amélioration de leurs processus métier.",
    complement:
      "Disponible pour des missions ponctuelles ou des projets plus structurés, avec une approche claire et sans jargon inutile.",
    asideBullets: [
      "Site vitrine, institutionnel ou e-commerce",
      "Refonte de site internet existant",
      "Solutions numériques sur mesure",
      "Automatisations IA pour faciliter votre quotidien",
    ],
    availability: "Ouvert aux missions",
    ctaProject: "Parlons de votre projet",
    ctaProjects: "Voir mes réalisations",
  },
  expertise: {
    eyebrow: "Expertise",
    title: "Partir du besoin, pas de la technologie",
    description:
      "Pas de formule toute faite : chaque projet part de votre activité, de vos contraintes et de vos objectifs, en France comme à l’international.",
    columnWeb: "Création web et applications",
    columnDigital: "Digitalisation et automatisation",
  },
  projects: {
    eyebrow: "Réalisations",
    title: "Produits livrés & études de cas",
    description:
      "Exemples concrets de sites, outils métier, automatisation et IA, pour illustrer la diversité des solutions possibles.",
    problem: "Problème",
    solution: "Solution",
    viewProject: "Voir le projet",
    linkSoon: "Lien bientôt disponible",
  },
  featuredAi: {
    pipelineAria: "Pipeline d’automatisation",
    pipelineSteps: [
      "Réception",
      "Analyse IA",
      "Catégorisation",
      "Priorisation",
      "Sentiment",
      "Routage",
      "Workflow",
      "Suivi",
    ],
    problem: "Problème",
    solution: "Solution",
    result: "Résultat",
    demoEyebrow: "Démonstration",
    demoTitle: "Démonstration interactive",
    demoBody:
      "Ouvrez l’application intégrée au portfolio pour manipuler le produit : analyse, demandes, réponses et automatisations.",
    demoCta: "Voir la démonstration",
    role: "Rôle : ",
  },
  windowsOptimizer: {
    problem: "Problème",
    solution: "Solution",
    capabilities: "Capabilités",
    capabilitiesList: [
      "Diagnostic guidé",
      "Scripts & automatisation",
      "Nettoyage système",
      "Analyse de processus",
      "Points de restauration",
      "Reporting d’intervention",
    ],
    galleryLabel: "Galerie Optimiseur Windows",
    footnote:
      "Application desktop en démonstration privée, sans URL publique inventée.",
  },
  projectManagement: {
    problem: "Problème",
    solution: "Solution",
    status: "Statut",
    githubCta: "Voir le projet sur GitHub",
    galleryLabel: "Galerie outil de gestion de projet",
  },
  journey: {
    eyebrow: "Parcours",
    title: "Une évolution entre technique et métier",
    description:
      "Un parcours construit entre développement, systèmes d’information et compréhension des besoins métiers, avec une évolution progressive vers la conception et le pilotage de solutions numériques.",
    earlyEyebrow: "Premières étapes",
    earlyTitle: "Développement, applications & premières missions",
    earlyBody:
      "Des expériences dans différents environnements et secteurs (web, applications, e-commerce, IT) qui ont posé les bases avant une montée progressive en responsabilité.",
    educationEyebrow: "Formations",
    educationTitle: "Diplômes",
    featuredToday: "Aujourd’hui",
    featuredKey: "Expérience clé",
  },
  contact: {
    eyebrow: "Contact",
    title: "Parlons de votre projet",
    intro:
      "Une question ou un projet ? Vous pouvez aussi me contacter pour demander un devis. Décrivez votre besoin et je vous répondrai directement par e-mail.",
    modalIntro:
      "Décrivez votre besoin et je vous répondrai directement par e-mail.",
    primaryCta: "Me contacter",
    navCta: "Contact",
    closeDialog: "Fermer la fenêtre de contact",
    close: "Fermer",
    successTitle: "Message envoyé",
    successBody: "Merci. Je reviens vers vous dès que possible.",
    cancel: "Annuler",
    submit: "Envoyer le message",
    submitting: "Envoi en cours…",
    serverError: "Impossible d’envoyer le message.",
    fields: {
      name: "Nom",
      email: "Email",
      subject: "Sujet",
      message: "Message",
    },
    validation: {
      invalidData: "Données invalides.",
      formCheck: "Vérifiez les champs du formulaire.",
      name: "Indiquez votre nom.",
      email: "Adresse e-mail invalide.",
      subject: "Indiquez un sujet.",
      message: "Message trop court.",
    },
  },
  footer: {
    tagline: "Création Web · Solutions numériques · Automatisation",
  },
  labels: {
    problem: "Problème",
    solution: "Solution",
    result: "Résultat",
  },
  mockups: {
    frameWindow: "Application · Windows",
    frameBrowser: "Aperçu produit",
    carouselDefaultLabel: "Galerie du projet",
    prevImage: "Image précédente",
    nextImage: "Image suivante",
    slideIndicators: "Indicateurs de slide",
    goToImage: (index) => `Aller à l’image ${index}`,
    slideOf: (current, total) => `${current} sur ${total}`,
  },
  notFound: {
    title: "Page introuvable",
    back: "Retour à l’accueil",
  },
  profile: {
    portraitAlt: (name) => `Portrait de ${name}`,
  },
  contactApi: {
    genericError:
      "Impossible d’envoyer le message pour le moment. Réessayez plus tard.",
  },
};

const en: PortfolioDictionary = {
  seo: {
    title: "Digital solutions & digitalization | Alexis Romney",
    description:
      "Custom digital solutions for businesses: digitalization, showcase and institutional sites, e-commerce, applications, and automation when the business case calls for it.",
    h1: "Custom solution development",
    keywords: [
      "digital solutions",
      "business digitalization",
      "custom software",
      "process automation",
      "showcase website",
      "institutional website",
      "custom e-commerce",
      "business applications",
      "artificial intelligence",
      "Alexis Romney",
    ],
    websiteName: "Alexis Romney · Portfolio",
    ogImageAlt:
      "Alexis Romney — custom solution development, digitalization, and automation",
  },
  a11y: {
    skipToContent: "Skip to content",
    mainNav: "Main",
    mobileNav: "Mobile",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menu: "Menu",
  },
  lang: {
    switchLabel: "Language",
    fr: "FR",
    en: "EN",
  },
  nav: {
    expertise: "Expertise",
    projects: "Work",
    journey: "Background",
    contact: "Contact",
  },
  hero: {
    mainIntro:
      "I support professionals and businesses from needs analysis through to production, in France and internationally, on new or redesigned websites, e-commerce, and business tools tailored to their needs.",
    complement:
      "Available for one-off assignments or longer projects, with a clear approach and no unnecessary jargon.",
    asideBullets: [
      "Showcase, institutional, or e-commerce websites",
      "Redesign of an existing website",
      "Custom digital solutions",
      "AI automations to simplify your day-to-day",
    ],
    availability: "Open to projects",
    ctaProject: "Let’s talk about your project",
    ctaProjects: "View my work",
  },
  expertise: {
    eyebrow: "Expertise",
    title: "Start from the need, not the technology",
    description:
      "No one-size-fits-all formula: every project starts from your activity, constraints, and goals, in France and abroad.",
    columnWeb: "Web & applications",
    columnDigital: "Digitalization & automation",
  },
  projects: {
    eyebrow: "Work",
    title: "Shipped products & case studies",
    description:
      "Concrete examples of websites, business tools, automation, and AI to show the range of possible solutions.",
    problem: "Problem",
    solution: "Solution",
    viewProject: "View project",
    linkSoon: "Link coming soon",
  },
  featuredAi: {
    pipelineAria: "Automation pipeline",
    pipelineSteps: [
      "Intake",
      "AI analysis",
      "Categorization",
      "Prioritization",
      "Sentiment",
      "Routing",
      "Workflow",
      "Follow-up",
    ],
    problem: "Problem",
    solution: "Solution",
    result: "Outcome",
    demoEyebrow: "Demo",
    demoTitle: "Interactive demo",
    demoBody:
      "Open the app embedded in this portfolio to explore the product: analysis, requests, responses, and automations.",
    demoCta: "View the demo",
    role: "Role: ",
  },
  windowsOptimizer: {
    problem: "Problem",
    solution: "Solution",
    capabilities: "Capabilities",
    capabilitiesList: [
      "Guided diagnostics",
      "Scripts & automation",
      "System cleanup",
      "Process analysis",
      "Restore points",
      "Intervention reporting",
    ],
    galleryLabel: "Windows Optimizer gallery",
    footnote: "Desktop app in private demo, no fabricated public URL.",
  },
  projectManagement: {
    problem: "Problem",
    solution: "Solution",
    status: "Status",
    githubCta: "View project on GitHub",
    galleryLabel: "Project management tool gallery",
  },
  journey: {
    eyebrow: "Background",
    title: "A path between engineering and business",
    description:
      "A career built across development, information systems, and understanding business needs, with a gradual shift toward designing and leading digital solutions.",
    earlyEyebrow: "Early steps",
    earlyTitle: "Development, apps & first assignments",
    earlyBody:
      "Experience across environments and sectors (web, applications, e-commerce, IT) that laid the groundwork before growing responsibility.",
    educationEyebrow: "Education",
    educationTitle: "Degrees",
    featuredToday: "Today",
    featuredKey: "Key experience",
  },
  contact: {
    eyebrow: "Contact",
    title: "Let’s talk about your project",
    intro:
      "Have a question or a project in mind? You can also contact me for a quote. Tell me about your needs and I will reply directly by email.",
    modalIntro: "Tell me about your needs and I will reply directly by email.",
    primaryCta: "Contact me",
    navCta: "Contact",
    closeDialog: "Close contact dialog",
    close: "Close",
    successTitle: "Message sent",
    successBody: "Thank you. I will get back to you as soon as possible.",
    cancel: "Cancel",
    submit: "Send message",
    submitting: "Sending…",
    serverError: "Unable to send the message.",
    fields: {
      name: "Name",
      email: "Email",
      subject: "Subject",
      message: "Message",
    },
    validation: {
      invalidData: "Invalid data.",
      formCheck: "Please check the form fields.",
      name: "Please enter your name.",
      email: "Invalid email address.",
      subject: "Please enter a subject.",
      message: "Message is too short.",
    },
  },
  footer: {
    tagline: EN_ACCENT_TAGLINE,
  },
  labels: {
    problem: "Problem",
    solution: "Solution",
    result: "Outcome",
  },
  mockups: {
    frameWindow: "Application · Windows",
    frameBrowser: "Product preview",
    carouselDefaultLabel: "Project gallery",
    prevImage: "Previous image",
    nextImage: "Next image",
    slideIndicators: "Slide indicators",
    goToImage: (index) => `Go to image ${index}`,
    slideOf: (current, total) => `${current} of ${total}`,
  },
  notFound: {
    title: "Page not found",
    back: "Back to home",
  },
  profile: {
    portraitAlt: (name) => `Portrait of ${name}`,
  },
  contactApi: {
    genericError: "Unable to send the message right now. Please try again later.",
  },
};

const dictionaries: Record<Locale, PortfolioDictionary> = { fr, en };

export function getPortfolioDictionary(locale: Locale): PortfolioDictionary {
  return dictionaries[locale];
}
