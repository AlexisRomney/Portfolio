/**
 * Source unique des projets du portfolio (accès par locale).
 */

import type { Locale } from "@/i18n/config";
import type { Project } from "@/data/project-types";
import { projectsEn } from "@/data/projects.en";
import { projectsFr } from "@/data/projects.fr";

export type { Project, ProjectStatus, ProjectVisual } from "@/data/project-types";

function projectsForLocale(locale: Locale): Project[] {
  return locale === "en" ? projectsEn : projectsFr;
}

export function getPublishedProjects(locale: Locale = "fr") {
  return projectsForLocale(locale).filter((p) => p.published);
}

export function getProject(id: string, locale: Locale = "fr") {
  return getPublishedProjects(locale).find((p) => p.id === id);
}

export function getProjectRaw(id: string, locale: Locale = "fr") {
  return projectsForLocale(locale).find((p) => p.id === id);
}

export function getFeaturedProject(locale: Locale = "fr") {
  return getPublishedProjects(locale).find((p) => p.featured);
}

export function getHighlightedProjects(locale: Locale = "fr") {
  return getPublishedProjects(locale).filter((p) => p.highlight);
}

export function getShowcaseProjects(locale: Locale = "fr") {
  return getPublishedProjects(locale).filter(
    (p) =>
      !p.featured &&
      p.id !== "gestion-projet" &&
      p.id !== "optimiseur-windows",
  );
}

export function getComingSoonProjects(locale: Locale = "fr") {
  return getPublishedProjects(locale).filter((p) => p.id === "gestion-projet");
}
