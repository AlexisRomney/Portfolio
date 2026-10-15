"use client";

import { motion, useReducedMotion } from "motion/react";
import { getShowcaseProjects, type Project } from "@/data/projects";
import { ExternalLinkIcon } from "@/components/icons/SocialIcons";
import { MockupFrame } from "@/components/ui/MockupFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { easeOut } from "@/lib/motion";

export function Projects() {
  const items = getShowcaseProjects();

  return (
    <Section
      id="projets"
      eyebrow="Réalisations"
      title="Produits livrés & études de cas"
      description={
        <>
          Exemples concrets de sites, outils métier, automatisation et IA,
          pour illustrer la diversité des solutions possibles.
        </>
      }
    >
      <div className="flex flex-col gap-8">
        {items.map((project, i) => (
          <ProjectRow key={project.id} project={project} index={i} />
        ))}
      </div>
    </Section>
  );
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const reduce = useReducedMotion();
  const visual = project.visuals[0];
  const reverse = index % 2 === 1;

  return (
    <Reveal delay={index * 0.05}>
      <motion.article
        whileHover={reduce ? undefined : { y: -4 }}
        transition={{ duration: 0.35, ease: easeOut }}
        className="group grid gap-8 border border-white/10 bg-[var(--ink)]/40 p-6 transition-[border-color] duration-300 hover:border-[var(--accent)]/45 sm:p-8 lg:grid-cols-2 lg:items-center"
      >
        <div className={reverse ? "lg:order-2" : undefined}>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--steel)]">
            {project.eyebrow}
          </p>
          <h3 className="mt-3 font-display text-3xl tracking-tight text-[var(--paper)]">
            {project.name}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {project.summary}
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--accent)]">
                Problème
              </dt>
              <dd className="mt-2 text-sm text-[var(--muted)]">{project.problem}</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--accent)]">
                Solution
              </dt>
              <dd className="mt-2 text-sm text-[var(--muted)]">{project.solution}</dd>
            </div>
          </dl>
          <ul className="mt-6 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]"
              >
                {tech}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {project.demoUrl ? (
              <a
                href={project.demoUrl}
                {...(project.demoUrl.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="inline-flex items-center gap-2 text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                Voir le projet
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="text-sm text-[var(--steel)]">
                Lien bientôt disponible
              </span>
            )}
          </div>
        </div>

        <div className={reverse ? "lg:order-1" : undefined}>
          {visual ? (
            <MockupFrame visual={visual} />
          ) : (
            <div
              className="aspect-[16/10] rounded-2xl border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),transparent_55%)]"
              aria-hidden
            />
          )}
        </div>
      </motion.article>
    </Reveal>
  );
}
