"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { profile } from "@/data/profile";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { easeOut } from "@/lib/motion";

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(40);
  const glow = useMotionTemplate`radial-gradient(520px circle at ${mx}% ${my}%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 55%)`;

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      mx.set(((e.clientX - rect.left) / rect.width) * 100);
      my.set(((e.clientY - rect.top) / rect.height) * 100);
    };

    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:px-16"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 hero-grid" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-90"
        style={{ backgroundImage: glow }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-24 -z-10 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--steel)_35%,transparent),transparent_70%)] blur-2xl sm:right-0"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-64 w-full bg-gradient-to-t from-[var(--ink)] to-transparent"
      />

      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.32em] text-[var(--accent)]"
          >
            {profile.role}
          </motion.p>

          <h1 className="font-display text-[clamp(3rem,9vw,6.4rem)] font-medium leading-[0.92] tracking-[-0.045em] text-[var(--paper)]">
            <AnimatedLine text={profile.name} delay={0.15} />
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: easeOut }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl"
          >
            {profile.tagline}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: easeOut }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <ButtonLink href="#projet-phare">Voir le projet phare</ButtonLink>
            <ButtonLink href="#contact" variant="outline">
              Me contacter
            </ButtonLink>
          </motion.div>
        </div>

        <motion.aside
          initial={reduce ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: easeOut }}
          className="relative border-t border-white/12 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"
        >
          <p className="text-sm leading-relaxed text-[var(--muted)]">{profile.shortBio}</p>
          <ul className="mt-8 space-y-3">
            {[
              "Besoin métier → solution",
              "Automatisation & workflows",
              "IA intégrée au processus",
              "Développement & déploiement",
            ].map((item, i) => (
              <motion.li
                key={item}
                initial={reduce ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.08, duration: 0.5, ease: easeOut }}
                className="flex items-center gap-3 text-sm text-[var(--paper)]"
              >
                <span className="h-px w-6 bg-[var(--accent)]" aria-hidden />
                {item}
              </motion.li>
            ))}
          </ul>
          <p className="mt-10 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--steel)]">
            {profile.availability}
          </p>
        </motion.aside>
      </div>
    </section>
  );
}

function AnimatedLine({ text, delay }: { text: string; delay: number }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) return <>{text}</>;

  return (
    <span className="inline-block">
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="mr-[0.22em] inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.85,
              delay: delay + wi * 0.12,
              ease: easeOut,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
