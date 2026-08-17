"use client";

import { profile } from "@/data/profile";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";

export function Contact() {
  const hasEmail = Boolean(profile.email);

  return (
    <section
      id="contact"
      className="relative overflow-hidden px-5 py-28 sm:px-8 sm:py-36 lg:px-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_50%)]"
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-[var(--accent)]">
            Contact
          </p>
          <h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.04em] text-[var(--paper)]">
            Construisons la prochaine solution ensemble
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Une mission de digitalisation, d’automatisation ou d’intégration IA ?
            Parlons de votre besoin métier et de la solution à mettre en place.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {hasEmail ? (
              <ButtonLink href={`mailto:${profile.email}`}>
                Écrire à {profile.email}
              </ButtonLink>
            ) : (
              <ButtonLink href={profile.github} target="_blank" rel="noopener noreferrer">
                Me trouver sur GitHub
              </ButtonLink>
            )}
            <ButtonLink
              href={profile.githubPortfolio}
              variant="outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Repository Portfolio
            </ButtonLink>
          </div>
          {!hasEmail ? (
            <p className="mt-6 text-sm text-[var(--steel)]">
              Ajoutez votre e-mail dans <code className="text-[var(--muted)]">src/data/profile.ts</code> pour activer le mailto.
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
