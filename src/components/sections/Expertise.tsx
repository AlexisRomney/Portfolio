"use client";

import {
  getCreationWebOffers,
  getDigitalisationOffers,
} from "@/data/expertise-locale";
import { useLocale, usePortfolioDictionary } from "@/components/providers/LocaleProvider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Expertise() {
  const locale = useLocale();
  const dict = usePortfolioDictionary();
  const creationWebOffers = getCreationWebOffers(locale);
  const digitalisationOffers = getDigitalisationOffers(locale);

  return (
    <Section
      id="expertise"
      tone="muted"
      eyebrow={dict.expertise.eyebrow}
      title={dict.expertise.title}
      description={dict.expertise.description}
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <OfferColumn
          eyebrow={dict.expertise.columnWeb}
          offers={creationWebOffers}
          delayBase={0}
        />
        <OfferColumn
          eyebrow={dict.expertise.columnDigital}
          offers={digitalisationOffers}
          delayBase={0.08}
        />
      </div>
    </Section>
  );
}

function OfferColumn({
  eyebrow,
  offers,
  delayBase,
}: {
  eyebrow: string;
  offers: readonly { id: string; title: string; description: string }[];
  delayBase: number;
}) {
  return (
    <div>
      <Reveal delay={delayBase}>
        <h3 className="font-display text-2xl tracking-tight text-[var(--paper)]">
          {eyebrow}
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
