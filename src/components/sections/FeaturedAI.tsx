"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getFeaturedProject } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";

const pipeline = [
  "Réception",
  "Analyse IA",
  "Catégorisation",
  "Priorisation",
  "Sentiment",
  "Routage",
  "Workflow",
  "Suivi",
];

export function FeaturedAI() {
  const project = getFeaturedProject();
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project || reduce || !stageRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-pipe]",
        { opacity: 0.25, y: 18 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top 70%",
            end: "bottom 55%",
            scrub: 0.6,
          },
        },
      );
    }, stageRef);

    return () => ctx.revert();
  }, [project, reduce]);

  if (!project) return null;

  return (
    <section
      id="projet-phare"
      className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32 lg:px-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--accent)_12%,transparent),transparent_55%)]"
      />
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-[var(--accent)]">
            {project.eyebrow}
          </p>
          <h2 className="max-w-4xl font-display text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.035em] text-[var(--paper)]">
            {project.name}
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            {project.summary}
          </p>
        </Reveal>

        <div
          ref={stageRef}
          className="mt-14 overflow-x-auto pb-2"
          aria-label="Pipeline d’automatisation"
        >
          <ol className="flex min-w-max gap-3 sm:min-w-0 sm:flex-wrap">
            {pipeline.map((step) => (
              <li
                key={step}
                data-pipe
                className="rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 font-mono text-xs tracking-wide text-[var(--paper)]"
              >
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal delay={0.1}>
            <div className="space-y-8">
              <Block label="Problème" text={project.problem} />
              <Block label="Solution" text={project.solution} />
              <Block label="Résultat" text={project.result} />
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <aside className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)] p-6 sm:p-8">
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] blur-2xl"
              />
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--steel)]">
                Emplacement démo
              </p>
              <h3 className="mt-4 font-display text-2xl text-[var(--paper)]">
                Démonstration à venir
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                L’application n’est pas encore hébergée publiquement (attente
                retours Oracle Cloud). Screenshots, vidéo et lien de démo seront
                ajoutés ici dès la mise en ligne — sans URL inventée.
              </p>
              <div className="mt-8 aspect-[16/10] rounded-xl border border-dashed border-white/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.04),transparent)]">
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[var(--steel)]">
                    Mockup / capture
                  </span>
                  <span className="text-sm text-[var(--muted)]">
                    Zone réservée aux visuels du produit
                  </span>
                </div>
              </div>
              <p className="mt-6 text-sm text-[var(--muted)]">
                <span className="text-[var(--paper)]">Rôle — </span>
                {project.role}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--accent)]">
        {label}
      </h3>
      <p className="mt-3 text-base leading-relaxed text-[var(--muted)]">{text}</p>
    </div>
  );
}
