"use client";

import Image from "next/image";
import { profile } from "@/data/profile";
import { usePortfolioDictionary } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/cn";

type ProfilePhotoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-12 w-12 text-sm",
  md: "h-20 w-20 text-xl",
  lg: "h-28 w-28 text-2xl sm:h-32 sm:w-32 sm:text-3xl",
} as const;

export function ProfilePhoto({ size = "md", className }: ProfilePhotoProps) {
  const dict = usePortfolioDictionary();
  const hasPhoto = Boolean(profile.photo);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full border border-[color-mix(in_oklab,var(--accent)_45%,transparent)] bg-[linear-gradient(145deg,var(--surface),var(--ink))] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.35)]",
        sizes[size],
        className,
      )}
    >
      {hasPhoto ? (
        <Image
          src={profile.photo}
          alt={dict.profile.portraitAlt(profile.name)}
          fill
          className="object-cover"
          sizes={size === "lg" ? "128px" : size === "md" ? "80px" : "48px"}
          priority={size === "lg"}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-display font-medium text-[var(--paper)]"
          aria-hidden
        >
          {profile.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </span>
      )}
    </div>
  );
}
