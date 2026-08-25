"use client";

import { getProject } from "@/data/projects";
import { MockupFrame } from "@/components/ui/MockupFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function ProjectManagement() {
  const project = getProject("gestion-projet");
  if (!project) return null;

  const visuals = project.visuals;

  return (
    <Section
      id="gestion-projet"
      tone="muted"
      eyebrow={project.eyebrow}
      title={project.name}
      description={project.summary}
    >
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <div className="space-y-6">
            <Block label="Problème" text={project.problem} />
            <Block label="Solution" text={project.solution} />
            <Block label="Statut" text={project.result} />
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
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-sm text-[var(--steel)]">
              Démonstration publique
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--accent)]">
                Bientôt
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {visuals[0] ? (
            <MockupFrame visual={visuals[0]} priority={false} />
          ) : null}
        </Reveal>
      </div>

      {visuals.length > 1 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visuals.slice(1).map((visual, i) => (
            <Reveal key={visual.src} delay={0.06 + i * 0.05}>
              <MockupFrame visual={visual} />
            </Reveal>
          ))}
        </div>
      ) : null}
    </Section>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--accent)]">
        {label}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
        {text}
      </p>
    </div>
  );
}
