import { profile } from "@/data/profile";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/8 px-5 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg text-[var(--paper)]">{profile.name}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Portfolio public — les autres repositories restent privés.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-[var(--muted)]">
          <a
            href={profile.githubPortfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            GitHub Portfolio
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            Profil GitHub
          </a>
          <span>© {year}</span>
        </div>
      </div>
    </footer>
  );
}
