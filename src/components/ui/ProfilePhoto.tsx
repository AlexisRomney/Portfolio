import Image from "next/image";
import { profile } from "@/data/profile";
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

/**
 * Affiche la photo de profil si `profile.photo` est renseigné,
 * sinon un monogramme cohérent avec l’identité visuelle.
 */
export function ProfilePhoto({ size = "md", className }: ProfilePhotoProps) {
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
          alt={`Portrait de ${profile.name}`}
          fill
          className="object-cover"
          sizes={size === "lg" ? "128px" : size === "md" ? "80px" : "48px"}
          priority={size === "lg"}
        />
      ) : (
        <div
          aria-hidden
          className="flex h-full w-full items-center justify-center font-display font-medium tracking-tight text-[var(--accent)]"
        >
          AR
        </div>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(198,164,107,0.18),transparent_55%)]"
      />
    </div>
  );
}
