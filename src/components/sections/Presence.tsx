"use client";

import type { ReactNode } from "react";
import { profile } from "@/data/profile";
import { GitHubIcon, LinkedInIcon } from "@/components/icons/SocialIcons";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Presence() {
  return (
    <Section
      id="presence"
      tone="muted"
      eyebrow="Présence"
      title="Retrouvez-moi ailleurs"
      description="Code ouvert sur GitHub, parcours et échanges professionnels sur LinkedIn."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Reveal>
          <SocialCard
            href={profile.github}
            icon={<GitHubIcon className="h-7 w-7" />}
            label="GitHub"
            handle="@AlexisRomney"
            detail="Repositories publics et expérimentations"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <SocialCard
            href={profile.linkedin}
            icon={<LinkedInIcon className="h-7 w-7" />}
            label="LinkedIn"
            handle="alexis-romney"
            detail="Parcours, actualités et contact professionnel"
          />
        </Reveal>
      </div>
    </Section>
  );
}

function SocialCard({
  href,
  icon,
  label,
  handle,
  detail,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  handle: string;
  detail: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-5 rounded-2xl border border-white/10 bg-[var(--ink)]/35 p-6 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/50 hover:bg-[var(--ink)]/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[var(--paper)] transition-colors group-hover:border-[var(--accent)]/40 group-hover:text-[var(--accent)]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-xl text-[var(--paper)]">
          {label}
        </span>
        <span className="mt-1 block font-mono text-xs text-[var(--accent)]">
          {handle}
        </span>
        <span className="mt-3 block text-sm text-[var(--muted)]">{detail}</span>
      </span>
    </a>
  );
}
