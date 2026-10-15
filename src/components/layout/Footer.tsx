"use client";

import { profile } from "@/data/profile";
import { GitHubIcon, LinkedInIcon } from "@/components/icons/SocialIcons";
import { usePortfolioDictionary } from "@/components/providers/LocaleProvider";

export function Footer() {
  const dict = usePortfolioDictionary();
  const year = new Date().getFullYear();
  const hasOrigin = Boolean(profile.githubOrigin);

  return (
    <footer className="border-t border-white/8 px-5 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg text-[var(--paper)]">{profile.name}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{dict.footer.tagline}</p>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm text-[var(--muted)]">
          {hasOrigin ? (
            <a
              href={profile.githubOrigin}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              GitHub Origin
            </a>
          ) : null}
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="inline-flex items-center gap-2 transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            <LinkedInIcon className="h-4 w-4" />
            LinkedIn
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex items-center gap-2 transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
          <span>© {year}</span>
        </div>
      </div>
    </footer>
  );
}
