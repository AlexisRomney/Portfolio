"use client";

import Link from "next/link";
import { usePortfolioDictionary, useLocale } from "@/components/providers/LocaleProvider";
import { localePath } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const dict = usePortfolioDictionary();

  return (
    <div
      className={cn(
        "flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-[0.18em]",
        className,
      )}
      role="navigation"
      aria-label={dict.lang.switchLabel}
    >
      <Link
        href={localePath("fr")}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
          locale === "fr"
            ? "bg-white/10 text-[var(--paper)]"
            : "text-[var(--muted)] hover:text-[var(--paper)]",
        )}
        aria-current={locale === "fr" ? "true" : undefined}
      >
        {dict.lang.fr}
      </Link>
      <span className="text-[var(--steel)]" aria-hidden>/</span>
      <Link
        href={localePath("en")}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
          locale === "en"
            ? "bg-white/10 text-[var(--paper)]"
            : "text-[var(--muted)] hover:text-[var(--paper)]",
        )}
        aria-current={locale === "en" ? "true" : undefined}
      >
        {dict.lang.en}
      </Link>
    </div>
  );
}
