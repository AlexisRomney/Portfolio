"use client";

import { useState } from "react";
import { profile } from "@/data/profile";
import { ContactModal } from "@/components/contact/ContactModal";
import { GitHubIcon, LinkedInIcon } from "@/components/icons/SocialIcons";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ProfilePhoto } from "@/components/ui/ProfilePhoto";
import { Reveal } from "@/components/ui/Reveal";

export function Contact() {
  const [open, setOpen] = useState(false);
  const hasOrigin = Boolean(profile.githubOrigin);

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
          <div className="mb-8 flex justify-center">
            <ProfilePhoto size="lg" />
          </div>
          <p className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-[var(--accent)]">
            Contact
          </p>
          <h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.04em] text-[var(--paper)]">
            Parlons de votre projet web
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Création de site vitrine, e-commerce ou refonte à La Réunion : décrivez
            votre besoin et je vous réponds avec une approche claire, adaptée à
            votre activité — sans jargon inutile.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" onClick={() => setOpen(true)}>
              Demander un devis
            </Button>
            {hasOrigin ? (
              <ButtonLink
                href={profile.githubOrigin}
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub — Origin
              </ButtonLink>
            ) : null}
            <ButtonLink
              href={profile.linkedin}
              variant="outline"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <LinkedInIcon className="h-4 w-4" />
              LinkedIn
            </ButtonLink>
            <ButtonLink
              href={profile.github}
              variant="outline"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <GitHubIcon className="h-4 w-4" />
              GitHub
            </ButtonLink>
          </div>
        </Reveal>
      </div>

      <ContactModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
