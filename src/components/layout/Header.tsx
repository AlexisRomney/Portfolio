"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { profile } from "@/data/profile";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { usePortfolioDictionary } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/cn";

export function Header() {
  const dict = usePortfolioDictionary();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const links = [
    { href: "#expertise", label: dict.nav.expertise },
    { href: "#projets", label: dict.nav.projects },
    { href: "#parcours", label: dict.nav.journey },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={reduce ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-400",
        scrolled || open
          ? "border-b border-white/8 bg-[color-mix(in_oklab,var(--ink)_82%,transparent)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-[4.25rem] sm:px-8 lg:px-0">
        <a
          href="#top"
          className="font-display text-lg tracking-tight text-[var(--paper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          {profile.name}
        </a>

        <nav className="hidden items-center gap-6 md:flex" aria-label={dict.a11y.mainNav}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--paper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-[var(--paper)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            {dict.contact.navCta}
          </a>
          <LanguageSwitcher />
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <a
            href="#contact"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-[var(--paper)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            {dict.contact.navCta}
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-[var(--paper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? dict.a11y.closeMenu : dict.a11y.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{dict.a11y.menu}</span>
            <span aria-hidden className="flex flex-col gap-1.5">
              <span
                className={cn(
                  "block h-px w-4 bg-current transition-transform",
                  open && "translate-y-[3.5px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-px w-4 bg-current transition-opacity",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-px w-4 bg-current transition-transform",
                  open && "-translate-y-[3.5px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-white/8 px-5 py-6 md:hidden"
          aria-label={dict.a11y.mobileNav}
        >
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block py-1 text-lg text-[var(--paper)]"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mt-2">
              <LanguageSwitcher />
            </li>
          </ul>
        </nav>
      ) : null}
    </motion.header>
  );
}
