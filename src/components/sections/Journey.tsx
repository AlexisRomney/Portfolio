"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journey, type JourneyItem } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const kindLabel: Record<JourneyItem["kind"], string> = {
  formation: "Formation",
  experience: "Expérience",
  evolution: "Évolution",
  projects: "Projets",
};

export function Journey() {
  const reduce = useReducedMotion();
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce || !lineRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: lineRef.current?.parentElement,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 0.5,
          },
        },
      );
    });
    return () => ctx.revert();
  }, [reduce]);

  return (
    <Section
      id="parcours"
      eyebrow="Parcours"
      title="De la formation à la digitalisation"
      description="Une trajectoire cohérente : ingénierie, expériences SI et process, puis solutions numériques — automatisation et IA appliquées aux métiers."
    >
      <ol className="relative space-y-12 pl-2 sm:pl-4">
        <div
          aria-hidden
          className="absolute bottom-2 left-[0.7rem] top-2 w-px origin-top bg-white/10 sm:left-[1.05rem]"
        >
          <div
            ref={lineRef}
            className="h-full w-full origin-top bg-gradient-to-b from-[var(--accent)] via-[var(--accent-soft)] to-transparent"
            style={{ transform: reduce ? "scaleY(1)" : "scaleY(0)" }}
          />
        </div>

        {journey.map((item, i) => (
          <Reveal key={`${item.title}-${item.period}`} delay={i * 0.06}>
            <li className="relative grid gap-3 pl-10 sm:pl-14 lg:grid-cols-[9rem_1fr] lg:gap-8">
              <span
                aria-hidden
                className="absolute left-[0.35rem] top-1.5 h-3 w-3 rounded-full border border-[var(--accent)] bg-[var(--ink)] shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_22%,transparent)] sm:left-[0.7rem]"
              />
              <div>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--accent)]">
                  {kindLabel[item.kind]}
                </p>
                <p className="mt-2 font-mono text-xs text-[var(--steel)]">
                  {item.period}
                </p>
              </div>
              <div>
                <h3 className="font-display text-2xl tracking-tight text-[var(--paper)]">
                  {item.title}
                </h3>
                {item.org ? (
                  <p className="mt-1 text-sm text-[var(--accent-soft)]">
                    {item.org}
                  </p>
                ) : null}
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                  {item.description}
                </p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
