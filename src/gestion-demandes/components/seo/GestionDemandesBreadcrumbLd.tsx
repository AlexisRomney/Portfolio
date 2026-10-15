"use client";

import { usePathname } from "next/navigation";
import { getGestionDemandesLandingBreadcrumb } from "@/lib/structured-data";

/** JSON-LD breadcrumb on the public landing only (matches portfolio link in PublicNav). */
export function GestionDemandesBreadcrumbLd() {
  const pathname = usePathname();
  const isLanding =
    pathname === "/gestion-demandes" || pathname === "/gestion-demandes/";

  if (!isLanding) {
    return null;
  }

  const data = getGestionDemandesLandingBreadcrumb();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
