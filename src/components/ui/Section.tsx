import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "contrast";
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  tone = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative px-5 py-24 sm:px-8 sm:py-32 md:px-12 lg:px-16",
        tone === "muted" && "bg-[var(--surface)]",
        tone === "contrast" && "bg-[var(--ink)] text-[var(--paper)]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-14 max-w-3xl md:mb-20">
          {eyebrow ? (
            <p className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-[var(--accent)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.03em]">
            {title}
          </h2>
          {description ? (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              {description}
            </p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}
