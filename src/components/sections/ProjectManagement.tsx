"use client";

import { getProject } from "@/data/projects";
import { GitHubIcon } from "@/components/icons/SocialIcons";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MockupCarousel } from "@/components/ui/MockupCarousel";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function ProjectManagement() {
  const project = getProject("gestion-projet");
  if (!project) return null;

  return (
    <Section
      id="gestion-projet"
      tone="muted"
      eyebrow={project.eyebrow}
      title={project.name}
      description={project.summary}
    >
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <div className="space-y-6">
            <Block label="Problème" text={project.problem} />
            <Block label="Solution" text={project.solution} />
            <Block label="Statut" text={project.result} />
            <ul className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]"
                >
                  {tech}
                </li>
              ))}
            </ul>
            {project.repoUrl ? (
              <ButtonLink
                href={project.repoUrl}
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon className="h-4 w-4" />
                Voir le projet sur GitHub
              </ButtonLink>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <MockupCarousel
            visuals={project.visuals}
            label="Galerie outil de gestion de projet"
          />
        </Reveal>
      </div>
    </Section>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--accent)]">
        {label}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
        {text}
      </p>
    </div>
  );
}
