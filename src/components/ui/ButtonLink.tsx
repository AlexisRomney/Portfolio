import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "ghost" | "outline";
  children: ReactNode;
};

export function ButtonLink({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-[transform,background-color,border-color,color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]",
        variant === "primary" &&
          "bg-[var(--accent)] text-[var(--ink)] hover:-translate-y-0.5 hover:bg-[var(--accent-soft)]",
        variant === "ghost" &&
          "text-[var(--paper)] hover:bg-white/5",
        variant === "outline" &&
          "border border-white/20 text-[var(--paper)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
