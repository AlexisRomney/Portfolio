"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  journeyEducation,
  journeyExperiences,
  type JourneyExperience,
} from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { easeOut } from "@/lib/motion";

export function Journey() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce || !trackRef.current || !lineRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: trackRef.current,
            start: "top 65%",
            end: "bottom 35%",
            scrub: 0.55,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-journey-item]").forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll("[data-reveal-detail]"),
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 74%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, trackRef);

    return () => ctx.revert();
  }, [reduce]);

  const featured = journeyExperiences.filter((e) => e.emphasis === "featured");
  const compact = journeyExperiences.filter((e) => e.emphasis === "compact");

  return (
    <Section
      id="parcours"
      eyebrow="Parcours"
      title="Une évolution entre technique et métier"
      description="Un parcours construit entre développement, systèmes d’information et compréhension des besoins métiers, avec une évolution progressive vers la conception et le pilotage de solutions numériques."
    >
      <div ref={trackRef} className="relative">
        <div
          aria-hidden
          className="absolute bottom-4 left-[0.7rem] top-4 w-px bg-white/10 sm:left-[1.05rem]"
        >
          <div
            ref={lineRef}
            className="h-full w-full origin-top bg-gradient-to-b from-[var(--accent)] via-[var(--accent-soft)] to-transparent"
            style={{ transform: reduce ? "scaleY(1)" : "scaleY(0)" }}
          />
        </div>

        <ol className="space-y-10 sm:space-y-14">
          {featured.map((item, i) => (
            <FeaturedCard key={item.id} item={item} index={i} reduce={!!reduce} />
          ))}

          <li className="relative pl-10 sm:pl-14" data-journey-item>
            <span
              aria-hidden
              className="absolute left-[0.35rem] top-2 h-3 w-3 rounded-full border border-[var(--steel)] bg-[var(--ink)] sm:left-[0.7rem]"
            />
            <Reveal>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--steel)]">
                Premières étapes
              </p>
              <h3 className="mt-2 font-display text-xl text-[var(--paper)] sm:text-2xl">
                Développement, applications & premières missions
              </h3>
              <p
                data-reveal-detail
                className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]"
                style={reduce ? undefined : { opacity: 0 }}
              >
                Des expériences dans différents environnements et secteurs —
                web, applications, e-commerce, IT — qui ont posé les bases
                avant une montée progressive en responsabilité.
              </p>
            </Reveal>

            <div className="mt-8 space-y-3">
              {compact.map((item, i) => (
                <CompactExperience
                  key={item.id}
                  item={item}
                  index={i}
                  reduce={!!reduce}
                />
              ))}
            </div>
          </li>

          <li className="relative pl-10 sm:pl-14" data-journey-item>
            <span
              aria-hidden
              className="absolute left-[0.35rem] top-2 h-3 w-3 rounded-full border border-white/25 bg-[var(--ink)] sm:left-[0.7rem]"
            />
            <Reveal>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--steel)]">
                Formations
              </p>
              <h3 className="mt-2 font-display text-xl text-[var(--paper)] sm:text-2xl">
                Diplômes
              </h3>
            </Reveal>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {journeyEducation.map((edu) => (
                <li
                  key={edu.id}
                  data-reveal-detail
                  className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-4"
                  style={reduce ? undefined : { opacity: 0 }}
                >
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--accent)]">
                    {edu.period}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--paper)] sm:text-base">
                    {edu.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{edu.org}</p>
                </li>
              ))}
            </ul>
          </li>
        </ol>
      </div>
    </Section>
  );
}

function FeaturedCard({
  item,
  index,
  reduce,
}: {
  item: JourneyExperience;
  index: number;
  reduce: boolean;
}) {
  return (
    <li className="relative pl-10 sm:pl-14" data-journey-item>
      <span
        aria-hidden
        className="absolute left-[0.28rem] top-3 h-3.5 w-3.5 rounded-full border border-[var(--accent)] bg-[var(--ink)] shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_22%,transparent)] sm:left-[0.62rem]"
      />
      <Reveal delay={index * 0.05}>
        <motion.article
          whileHover={reduce ? undefined : { y: -3 }}
          transition={{ duration: 0.35, ease: easeOut }}
          className="overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.04),transparent_55%)] p-5 sm:p-7"
        >
          <span className="inline-flex rounded-full border border-[var(--accent)]/35 bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--accent)]">
            {index === 0 ? "Aujourd’hui" : "Expérience clé"}
          </span>

          <p className="mt-5 font-mono text-xs tracking-wide text-[var(--accent-soft)] sm:text-sm">
            {item.period}
          </p>
          <h3 className="mt-2 font-display text-2xl tracking-tight text-[var(--paper)] sm:text-3xl">
            {item.title}
          </h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            <span className="text-[var(--paper)]">{item.org}</span>
            <span className="text-[var(--steel)]"> · {item.place}</span>
          </p>

          <p
            data-reveal-detail
            className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base"
            style={reduce ? undefined : { opacity: 0 }}
          >
            {item.summary}
          </p>

          <ul
            data-reveal-detail
            className="mt-6 grid gap-2 sm:grid-cols-2"
            style={reduce ? undefined : { opacity: 0 }}
          >
            {item.highlights.map((point) => (
              <li
                key={point}
                className="rounded-lg border border-white/8 bg-[var(--ink)]/40 px-3 py-2.5 text-sm text-[var(--paper)]/90"
              >
                {point}
              </li>
            ))}
          </ul>
        </motion.article>
      </Reveal>
    </li>
  );
}

function CompactExperience({
  item,
  index,
  reduce,
}: {
  item: JourneyExperience;
  index: number;
  reduce: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <Reveal delay={index * 0.04}>
      <div
        data-reveal-detail
        className="rounded-xl border border-white/8 bg-white/[0.015] transition-[border-color] duration-300 hover:border-white/16"
        style={reduce ? undefined : { opacity: 0 }}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h4 className="font-display text-base text-[var(--paper)] sm:text-lg">
                {item.title}
              </h4>
              <p className="shrink-0 font-mono text-[0.65rem] text-[var(--steel)]">
                {item.period}
              </p>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              <span className="text-[var(--paper)]/90">{item.org}</span>
              <span className="text-[var(--steel)]"> · {item.place}</span>
            </p>
          </div>
          <span
            aria-hidden
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[var(--steel)]"
          >
            <motion.span
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="text-lg leading-none"
            >
              +
            </motion.span>
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id={panelId}
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="overflow-hidden"
            >
              <ul className="space-y-2 border-t border-white/8 px-4 pb-4 pt-3 sm:px-5">
                {item.highlights.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2 text-sm leading-relaxed text-[var(--muted)]"
                  >
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]"
                      aria-hidden
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}
