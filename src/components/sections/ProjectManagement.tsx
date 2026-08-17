"use client";

import { getProject } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function ProjectManagement() {
  const project = getProject("gestion-projet");
  if (!project) return null;

  return (
    <Section
      id="gestion-projet"
      tone="muted"
      eyebrow={project.eyebrow}
      title={project.name}
      description="Section réservée : architecture visuelle prête pour screenshots, description détaillée, technologies et lien de démonstration."
    >
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          <Placeholder title="Screenshots" note="Visuels à ajouter" />
          <Placeholder title="Description" note={project.summary} />
          <Placeholder title="Démonstration" note="Lien futur — non inventé" />
        </div>
      </Reveal>
    </Section>
  );
}

function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="min-h-48 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[var(--steel)]">
        {title}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{note}</p>
    </div>
  );
}
