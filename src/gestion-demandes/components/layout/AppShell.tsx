"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TicketsProvider } from "@gd/lib/tickets-store";
import { MobileNav } from "./MobileNav";
import { PublicNav } from "./PublicNav";
import { Sidebar } from "./Sidebar";

function isPublicRoute(pathname: string): boolean {
  return pathname === "/gestion-demandes" || pathname === "/gestion-demandes/" || pathname === "/gestion-demandes/fonctionnement";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = isPublicRoute(pathname);

  return (
    <TicketsProvider>
      {isPublic ? (
        <div className="landing-shell">
          <PublicNav />
          <main className="public-main">{children}</main>
        </div>
      ) : (
        <div className="app-shell">
          <Sidebar />
          <div className="app-main">
            <main className="app-content">{children}</main>
          </div>
          <MobileNav />
        </div>
      )}
    </TicketsProvider>
  );
}
