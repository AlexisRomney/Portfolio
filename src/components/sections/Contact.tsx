"use client";

import { useState } from "react";
import { profile } from "@/data/profile";
import { ContactModal } from "@/components/contact/ContactModal";
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
            Construisons la prochaine solution ensemble
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Une mission de digitalisation, d’automatisation ou d’intégration IA ?
            Parlons de votre besoin métier et de la solution à mettre en place.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" onClick={() => setOpen(true)}>
              Me contacter
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
            >
              LinkedIn
            </ButtonLink>
          </div>
        </Reveal>
      </div>

      <ContactModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
