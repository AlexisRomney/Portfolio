"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { easeOut } from "@/lib/motion";
import type { ProjectVisual } from "@/data/projects";
import { usePortfolioDictionary } from "@/components/providers/LocaleProvider";

type Props = {
  visuals: ProjectVisual[];
  className?: string;
  priority?: boolean;
  /** Libellé accessible du carrousel */
  label?: string;
};

export function MockupCarousel({
  visuals,
  className,
  priority,
  label,
}: Props) {
  const dict = usePortfolioDictionary();
  const carouselLabel = label ?? dict.mockups.carouselDefaultLabel;
  const reduce = useReducedMotion();
  const reactId = useId();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const count = visuals.length;
  const current = visuals[index] ?? visuals[0];
  const frame = current?.frame ?? "browser";

  const goTo = useCallback(
    (next: number, dir?: number) => {
      if (count < 2) return;
      const normalized = ((next % count) + count) % count;
      setDirection(dir ?? (normalized > index ? 1 : -1));
      setIndex(normalized);
    },
    [count, index],
  );

  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);

  const onPointerDown = (e: ReactPointerEvent) => {
    touchStartX.current = e.clientX;
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 48) return;
    if (delta > 0) prev();
    else next();
  };

  const onRootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  if (!current) return null;

  const width = current.width;
  const height = current.height;

  const variants = reduce
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (dir: number) => ({
          opacity: 0,
          x: dir >= 0 ? 28 : -28,
        }),
        center: {
          opacity: 1,
          x: 0,
        },
        exit: (dir: number) => ({
          opacity: 0,
          x: dir >= 0 ? -28 : 28,
        }),
      };

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={carouselLabel}
      onKeyDown={onRootKeyDown}
      className={cn(
        "group/carousel relative outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)]",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#0a0c10] shadow-[0_30px_80px_-28px_rgba(0,0,0,0.85)]">
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
              {frame === "window" ? dict.mockups.frameWindow : dict.mockups.frameBrowser}
            </span>
            {count > 1 ? (
              <span className="ml-auto font-mono text-[0.6rem] tabular-nums tracking-wide text-[var(--steel)]">
                {index + 1} / {count}
              </span>
            ) : null}
          </div>
        ) : null}

        <div
          className="relative w-full touch-pan-y overflow-hidden bg-[#07090c]"
          style={{ aspectRatio: `${width} / ${height}` }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            touchStartX.current = null;
          }}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current.src}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0.2 : 0.45, ease: easeOut }}
              className="absolute inset-0"
              role="group"
              aria-roledescription="slide"
              aria-label={dict.mockups.slideOf(index + 1, count)}
              id={`${reactId}-slide-${index}`}
            >
              <Image
                src={current.src}
                alt={current.alt}
                width={width}
                height={height}
                priority={priority && index === 0}
                draggable={false}
                className="h-full w-full object-contain select-none"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) min(90vw, 896px), min(50vw, 720px)"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {count > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CarouselButton
              label={dict.mockups.prevImage}
              onClick={prev}
              icon="prev"
            />
            <CarouselButton label={dict.mockups.nextImage} onClick={next} icon="next" />
          </div>

          <div
            className="flex items-center gap-1.5"
            role="tablist"
            aria-label={dict.mockups.slideIndicators}
          >
            {visuals.map((v, i) => (
              <button
                key={v.src}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={dict.mockups.goToImage(i + 1)}
                onClick={() => goTo(i, i > index ? 1 : -1)}
                className={cn(
                  "h-2 rounded-full transition-[width,background-color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                  i === index
                    ? "w-6 bg-[var(--accent)]"
                    : "w-2 bg-white/25 hover:bg-white/45",
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CarouselButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: "prev" | "next";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-[var(--paper)] transition-[border-color,background-color,transform] duration-300 hover:border-[var(--accent)]/50 hover:bg-white/[0.07] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {icon === "prev" ? (
          <path d="M15 18 9 12l6-6" />
        ) : (
          <path d="m9 18 6-6-6-6" />
        )}
      </svg>
    </button>
  );
}
