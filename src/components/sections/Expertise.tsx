"use client";

import {
  automationAiOffers,
  creationWebOffers,
} from "@/data/expertise";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Expertise() {
  return (
    <Section
      id="expertise"
      tone="muted"
      eyebrow="Expertise"
      title="Ce que je mets en œuvre"
      description="Deux domaines indépendants, au même niveau. Un projet peut n’en mobiliser qu’un — ou les deux, uniquement si le besoin le justifie."
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <OfferColumn
          eyebrow="Création Web"
          title="Sites, e-commerce & applications"
          offers={creationWebOffers}
          delayBase={0}
        />
        <OfferColumn
          eyebrow="Automatisation & IA"
          title="Processus, workflows & intelligence"
          offers={automationAiOffers}
          delayBase={0.08}
        />
      </div>
    </Section>
  );
}

function OfferColumn({
  eyebrow,
  title,
  offers,
  delayBase,
}: {
  eyebrow: string;
  title: string;
  offers: readonly { id: string; title: string; description: string }[];
  delayBase: number;
}) {
  return (
    <div>
      <Reveal delay={delayBase}>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h3 className="mt-3 font-display text-2xl tracking-tight text-[var(--paper)]">
          {title}
        </h3>
      </Reveal>
      <div className="mt-8 space-y-8">
        {offers.map((item, i) => (
          <Reveal key={item.id} delay={delayBase + 0.05 + i * 0.05}>
            <article className="relative pl-4 before:absolute before:left-0 before:top-1 before:h-8 before:w-px before:bg-[var(--accent)] before:content-['']">
              <h4 className="font-display text-lg tracking-tight text-[var(--paper)]">
                {item.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
