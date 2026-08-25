"use client";

import { getProject } from "@/data/projects";
import { MockupFrame } from "@/components/ui/MockupFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const capabilities = [
  "Diagnostic guidé",
  "Scripts & automatisation",
  "Nettoyage système",
  "Analyse de processus",
  "Points de restauration",
  "Reporting d’intervention",
];

export function WindowsOptimizer() {
  const project = getProject("optimiseur-windows");
  if (!project) return null;

  const [primary, ...rest] = project.visuals;

  return (
    <Section
      id="optimiseur"
      eyebrow={project.eyebrow}
      title={project.name}
      description={project.summary}
    >
      <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          {primary ? (
            <MockupFrame visual={primary} priority />
          ) : (
            <div className="aspect-[16/10] rounded-2xl border border-white/10 bg-[var(--surface)]" />
          )}
        </Reveal>

        <Reveal delay={0.12}>
          <div className="flex h-full flex-col justify-center space-y-8 lg:pt-4">
            <div>
              <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--accent)]">
                Problème
              </h3>
              <p className="mt-3 text-[var(--muted)]">{project.problem}</p>
            </div>
            <div>
              <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--accent)]">
                Solution
              </h3>
              <p className="mt-3 text-[var(--muted)]">{project.solution}</p>
            </div>
            <div>
              <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--accent)]">
                Capabilités
              </h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {capabilities.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5 text-sm text-[var(--paper)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
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
            <p className="text-sm text-[var(--steel)]">
              Application desktop — démonstration privée, pas d’URL publique
              inventée.
            </p>
          </div>
        </Reveal>
      </div>

      {rest.length > 0 ? (
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {rest.map((visual, i) => (
            <Reveal key={visual.src} delay={0.08 + i * 0.06}>
              <MockupFrame visual={visual} />
            </Reveal>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
