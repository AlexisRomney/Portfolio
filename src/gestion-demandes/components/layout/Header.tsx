"use client";

import type { ReactNode } from "react";
import { Button } from "@gd/components/ui/Button";
import { useI18n } from "@gd/i18n";

export function Header({
  title,
  subtitle,
  actions,
  showNewRequest = true,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** Bouton Dashboard → page publique de création (`/`). */
  showNewRequest?: boolean;
}) {
  const { t } = useI18n();

  return (
    <header className="page-header">
      <div className="page-header-copy">
        <h1>{title}</h1>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>
      <div className="page-header-actions">
        {actions}
        {showNewRequest ? (
          <Button href="/gestion-demandes" className="new-request-btn">
            {t("header.newRequest")}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
