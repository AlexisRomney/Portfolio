"use client";

import { motion, useReducedMotion } from "motion/react";
import { getShowcaseProjects, type Project } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { easeOut } from "@/lib/motion";

export function Projects() {
  const items = getShowcaseProjects();

  return (
    <Section
      id="projets"
      tone="muted"
      eyebrow="Réalisations"
      title="Études de cas & produits livrés"
      description="Des projets présentés comme des réalisations : problème, solution, technologies et résultat — pas une simple liste de liens."
    >
      <div className="flex flex-col gap-6">
        {items.map((project, i) => (
          <ProjectRow key={project.id} project={project} index={i} />
        ))}
      </div>
    </Section>
  );
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const reduce = useReducedMotion();

  return (
    <Reveal delay={index * 0.05}>
      <motion.article
        whileHover={reduce ? undefined : { y: -4 }}
        transition={{ duration: 0.35, ease: easeOut }}
        className="group grid gap-6 border border-white/10 bg-[var(--ink)]/40 p-6 transition-[border-color] duration-300 hover:border-[var(--accent)]/50 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div>
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
        </div>

        <div className="flex flex-col justify-between gap-6 border-t border-white/8 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div
            className="aspect-[16/10] rounded-xl border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),transparent_55%)]"
            aria-hidden
          >
            <div className="flex h-full items-end p-4">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--steel)]">
                Visuel · {project.visualTone}
              </span>
            </div>
          </div>
          <div>
            <ul className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]"
                >
                  {tech}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              {project.demoUrl ? (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                >
                  Voir la démonstration
                  <span aria-hidden>↗</span>
                </a>
              ) : (
                <span className="text-sm text-[var(--steel)]">Lien bientôt disponible</span>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    </Reveal>
  );
}
