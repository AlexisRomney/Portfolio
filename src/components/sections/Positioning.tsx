"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "@/components/ui/Section";
import { easeOut } from "@/lib/motion";
import { sectionLinkClass } from "@/lib/section-link";

const solutionDomains = [
  {
    id: "sites",
    title: "Sites web",
    items: "Vitrine · Institutionnel · E-commerce",
  },
  {
    id: "solutions",
    title: "Solutions numériques",
    items: "Applications · Fonctionnalités sur mesure",
  },
  {
    id: "automation",
    title: "Automatisation & IA",
    items: "Automatisation · Intelligence artificielle · Digitalisation",
  },
] as const;

export function Positioning() {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce || !stageRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const intro = stageRef.current?.querySelector("[data-axis-converge]");
      const cards = stageRef.current?.querySelectorAll("[data-domain-card]");

      if (intro) {
        gsap.fromTo(
          intro,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: stageRef.current,
              start: "top 75%",
              end: "center 55%",
              scrub: 0.55,
            },
          },
        );
      }

      if (cards?.length) {
        gsap.fromTo(
          cards,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            ease: "none",
            scrollTrigger: {
              trigger: stageRef.current,
              start: "top 60%",
              end: "center 40%",
              scrub: 0.5,
            },
          },
        );
      }
    }, stageRef);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <Section
      id="positionnement"
      eyebrow="Positionnement"
      title="Un site web clair, puis ce qu’il faut vraiment"
      description="Pas de formule toute faite : chaque projet de création ou de refonte de site internet part de votre activité, de votre zone (La Réunion ou ailleurs) et de vos objectifs réels."
    >
      <div ref={stageRef} className="relative">
        <div
          data-axis-converge
          className="relative overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.05),transparent_60%)] px-6 py-8 text-center sm:px-10 sm:py-10"
          style={reduce ? undefined : { opacity: 0 }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent"
          />
          <h3 className="font-display text-[clamp(1.6rem,3.5vw,2.4rem)] tracking-tight text-[var(--paper)]">
            Création de site internet d’abord, solutions numériques ensuite
          </h3>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            <a href="#expertise" className={sectionLinkClass}>
              Sites vitrines
            </a>
            , institutionnels et boutiques en ligne pour donner une présence
            professionnelle crédible. Au-delà du web, j’intègre des fonctionnalités
            sur mesure, de l’automatisation ou de l’IA uniquement quand cela
            simplifie réellement votre quotidien.{" "}
            <a href="#projets" className={sectionLinkClass}>
              Voir les réalisations
            </a>
          </p>
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {solutionDomains.map((domain) => (
            <DomainCard key={domain.id} title={domain.title} items={domain.items} />
          ))}
        </ul>
      </div>
    </Section>
  );
}

function DomainCard({ title, items }: { title: string; items: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.li
      data-domain-card
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className="group relative list-none overflow-hidden rounded-2xl border border-white/12 bg-white/[0.02] p-6 text-left transition-[border-color] duration-300 hover:border-[var(--accent)]/45 sm:p-7"
      style={reduce ? undefined : { opacity: 0 }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/35 to-transparent opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <h4 className="font-display text-xl tracking-tight text-[var(--paper)] sm:text-2xl">
        {title}
      </h4>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] transition-colors group-hover:text-[var(--paper)]/85">
        {items}
      </p>
    </motion.li>
  );
}
