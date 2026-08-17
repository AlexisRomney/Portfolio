"use client";

import { journey } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Journey() {
  return (
    <Section
      id="parcours"
      eyebrow="Parcours"
      title="Une trajectoire orientée solutions"
      description="De la compréhension métier à la livraison technique — une progression cohérente autour de la digitalisation et de l’automatisation."
    >
      <ol className="relative space-y-10 border-l border-white/12 pl-8">
        {journey.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.08}>
            <li className="relative">
              <span
                aria-hidden
                className="absolute -left-[2.15rem] top-1.5 h-3 w-3 rounded-full border border-[var(--accent)] bg-[var(--ink)]"
              />
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--steel)]">
                {item.period}
              </p>
              <h3 className="mt-2 font-display text-2xl text-[var(--paper)]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                {item.description}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
