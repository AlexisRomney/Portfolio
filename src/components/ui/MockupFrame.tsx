"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { easeOut } from "@/lib/motion";
import type { ProjectVisual } from "@/data/projects";

type Props = {
  visual: ProjectVisual;
  className?: string;
  priority?: boolean;
  /** Légère perspective 3D sur le cadre (pas sur le bitmap) */
  tilt?: boolean;
};

export function MockupFrame({
  visual,
  className,
  priority,
  tilt = true,
}: Props) {
  const reduce = useReducedMotion();
  const frame = visual.frame ?? "browser";
  const width = visual.width ?? 1024;
  const height = visual.height ?? 512;

  return (
    <motion.div
      whileHover={
        reduce || !tilt
          ? undefined
          : { y: -6, rotateX: 1.5, rotateY: -2 }
      }
      transition={{ duration: 0.45, ease: easeOut }}
      style={{ transformPerspective: 1200 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/12 bg-[#0a0c10] shadow-[0_30px_80px_-28px_rgba(0,0,0,0.85)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_55%)] opacity-70"
      />

      {frame !== "plain" ? (
        <div className="relative z-[1] flex items-center gap-2 border-b border-white/8 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/90" />
          <span className="ml-2 truncate font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--steel)]">
            {frame === "window" ? "Application · Windows" : "Aperçu produit"}
          </span>
        </div>
      ) : null}

      {/*
        Conteneur au ratio natif de la capture — pas de aspect 16/10 forcé,
        pas d’object-cover (évite crop + zoom + pixelisation).
      */}
      <div
        className="relative w-full bg-[#07090c]"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <Image
          src={visual.src}
          alt={visual.alt}
          width={width}
          height={height}
          priority={priority}
          className="h-auto w-full object-contain"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) min(90vw, 896px), min(50vw, 720px)"
        />
      </div>
    </motion.div>
  );
}

type StackProps = {
  visuals: ProjectVisual[];
  className?: string;
};

/** Empilement léger de mockups pour une section phare */
export function MockupStack({ visuals, className }: StackProps) {
  if (!visuals.length) return null;
  const primary = visuals[0];
  const secondary = visuals.slice(1, 3);

  return (
    <div className={cn("relative", className)}>
      <MockupFrame visual={primary} priority className="relative z-10" />
      {secondary.map((v, i) => (
        <div
          key={v.src}
          aria-hidden
          className={cn(
            "pointer-events-none absolute hidden w-[72%] opacity-50 sm:block",
            i === 0
              ? "-bottom-6 -right-4 z-0 rotate-[-4deg] lg:-right-8"
              : "-bottom-10 -left-3 z-0 rotate-[3deg] lg:-left-6",
          )}
        >
          <MockupFrame visual={v} tilt={false} className="shadow-none" />
        </div>
      ))}
    </div>
  );
}
