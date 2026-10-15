"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { getPortfolioDictionary } from "@/i18n/portfolio-dictionary";

function localeFromPath(pathname: string | null): Locale {
  const segment = pathname?.split("/").filter(Boolean)[0];
  return segment === "en" ? "en" : "fr";
}

export function NotFoundContent() {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);
  const dict = getPortfolioDictionary(locale);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-5 py-24 text-center">
      <h1 className="font-display text-3xl text-[var(--paper)]">{dict.notFound.title}</h1>
      <p className="mt-4 text-sm text-[var(--muted)]">
        <Link
          href={localePath(locale)}
          className="text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          {dict.notFound.back}
        </Link>
      </p>
    </main>
  );
}
