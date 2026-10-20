"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { profile } from "@/data/profile";
import { getLocalizedProfile } from "@/data/profile-locale";
import { useLocale, usePortfolioDictionary } from "@/components/providers/LocaleProvider";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { heroEase, heroStagger } from "@/lib/hero-motion";
import { easeOut } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

export function Hero() {
  const locale = useLocale();
  const dict = usePortfolioDictionary();
  const localizedProfile = getLocalizedProfile(locale);
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(40);
  const glow = useMotionTemplate`radial-gradient(520px circle at ${mx}% ${my}%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 55%)`;

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:px-16"
      onPointerMove={
        reduce
          ? undefined
          : (e) => {
              const el = ref.current;
              if (!el) return;
              const rect = el.getBoundingClientRect();
              mx.set(((e.clientX - rect.left) / rect.width) * 100);
              my.set(((e.clientY - rect.top) / rect.height) * 100);
            }
      }
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

      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-end lg:gap-x-16 lg:gap-y-12">
        <div className="min-w-0">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroStagger.role, ease: heroEase }}
            className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.32em] text-[var(--accent)]"
          >
            {localizedProfile.role}
          </motion.p>

          <h1 className="font-display text-[clamp(2rem,5.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.035em] text-[var(--paper)]">
            {dict.seo.h1}
          </h1>

          <p className="mt-5 font-display text-[clamp(2.2rem,7vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.04em] text-[var(--paper)]">
            <AnimatedLine text={profile.name} reduce={reduce} />
          </p>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroStagger.intro, ease: heroEase }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl"
          >
            {dict.hero.mainIntro}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroStagger.cta, ease: heroEase }}
            className="mt-10 flex max-w-xl flex-wrap gap-3"
          >
            <ButtonLink href="#contact">{dict.hero.ctaProject}</ButtonLink>
            <ButtonLink href="#projets" variant="outline">
              {dict.hero.ctaProjects}
            </ButtonLink>
          </motion.div>
        </div>

        <motion.aside
          initial={reduce ? false : { opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...heroStagger.aside, ease: heroEase }}
          className="relative min-w-0 border-t border-white/12 pt-10 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-1 xl:pl-16"
        >
          <div className="flex flex-col gap-7 lg:gap-8">
            <ul className="space-y-3.5">
              {dict.hero.asideBullets.map((item, i) => (
                <motion.li
                  key={item}
                  initial={reduce ? false : { opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: heroStagger.bulletBase + i * heroStagger.bulletStep,
                    duration: 0.4,
                    ease: easeOut,
                  }}
                  className="flex items-start gap-3 text-sm leading-snug text-[var(--paper)]"
                >
                  <span
                    className="mt-[0.55rem] h-px w-6 shrink-0 bg-[var(--accent)]"
                    aria-hidden
                  />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {dict.hero.complement}
            </p>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--steel)]">
              {dict.hero.availability}
            </p>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

function AnimatedLine({ text, reduce }: { text: string; reduce: boolean }) {
  const words = text.split(" ");

  if (reduce) return <>{text}</>;

  return (
    <span className="inline-block">
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="mr-[0.22em] inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "55%", opacity: 0.35 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: heroStagger.nameDuration,
              delay: heroStagger.nameWordBase + wi * heroStagger.nameWordStep,
              ease: heroEase,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
