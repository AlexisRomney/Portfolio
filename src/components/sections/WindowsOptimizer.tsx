"use client";

import { getProject } from "@/data/projects";
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

  return (
    <Section
      id="optimiseur"
      eyebrow={project.eyebrow}
      title={project.name}
      description={project.summary}
    >
      <div className="grid items-stretch gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)] p-1">
            <div className="rounded-[0.9rem] bg-[linear-gradient(160deg,#12161d_0%,#0b0e13_55%,#151a22_100%)] p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[var(--steel)]">
                  Wizard · Windows
                </span>
              </div>
              <div className="space-y-3">
                {capabilities.map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <span className="text-sm text-[var(--paper)]">{item}</span>
                    <span className="font-mono text-[0.65rem] text-[var(--accent)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="flex h-full flex-col justify-center space-y-8">
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
                Résultat
              </h3>
              <p className="mt-3 text-[var(--muted)]">{project.result}</p>
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
              Démonstration desktop privée — pas d’URL publique inventée.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
