"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const steps = [
  {
    n: "01",
    title: "Comprendre",
    text: "Analyser le besoin métier, les contraintes et les frictions du processus réel.",
  },
  {
    n: "02",
    title: "Concevoir",
    text: "Définir une solution claire : parcours, données, règles et expérience utilisateur.",
  },
  {
    n: "03",
    title: "Automatiser",
    text: "Orchestrer les flux, intégrer l’IA utile et supprimer le travail répétitif.",
  },
  {
    n: "04",
    title: "Déployer",
    text: "Livrer un outil fiable, mesurable et prêt à évoluer avec l’organisation.",
  },
];

export function Positioning() {
  return (
    <Section
      id="positionnement"
      eyebrow="Positionnement"
      title="Du besoin métier à la solution automatisée"
      description="Je ne me limite pas à l’interface. Je construis des systèmes qui comprennent le contexte, automatisent les décisions répétitives et s’intègrent au quotidien des équipes."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.08}>
            <article className="group h-full border-t border-white/12 pt-6 transition-colors hover:border-[var(--accent)]">
              <p className="font-mono text-xs tracking-[0.2em] text-[var(--steel)]">
                {step.n}
              </p>
              <h3 className="mt-4 font-display text-2xl tracking-tight text-[var(--paper)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {step.text}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
