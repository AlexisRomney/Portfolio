"use client";

import { expertise } from "@/data/expertise";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Expertise() {
  return (
    <Section
      id="expertise"
      tone="muted"
      eyebrow="Expertise"
      title="Ce que je sais faire concrètement"
      description="Un positionnement transversal : digitalisation, automatisation, IA, outils métier et pilotage de projet."
    >
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {expertise.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.06}>
            <article className="relative pl-4 before:absolute before:left-0 before:top-1 before:h-8 before:w-px before:bg-[var(--accent)] before:content-['']">
              <h3 className="font-display text-xl tracking-tight text-[var(--paper)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {item.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
