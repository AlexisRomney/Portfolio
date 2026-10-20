"use client";

import { useEffect, type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;
    let frame = 0;
    let cancelled = false;

    const start = () => {
      if (cancelled || media.matches) return;

      void import("lenis").then(({ default: Lenis }) => {
        if (cancelled || media.matches) return;

        lenis = new Lenis({
          duration: 1.1,
          smoothWheel: true,
          touchMultiplier: 1.2,
        });

        const raf = (time: number) => {
          lenis?.raf(time);
          frame = requestAnimationFrame(raf);
        };
        frame = requestAnimationFrame(raf);
      });
    };

    const idleId =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(start, { timeout: 1500 })
        : window.setTimeout(start, 1);

    const onChange = () => {
      if (media.matches) {
        cancelAnimationFrame(frame);
        lenis?.destroy();
        lenis = null;
      }
    };
    media.addEventListener("change", onChange);

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId as number);
      } else {
        window.clearTimeout(idleId);
      }
      media.removeEventListener("change", onChange);
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
