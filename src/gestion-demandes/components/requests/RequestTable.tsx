"use client";

import Link from "next/link";
import type { Ticket } from "@gd/types/ticket";
import { PriorityBadge, StatusBadge } from "@gd/components/ui/Badge";
import { Button } from "@gd/components/ui/Button";
import { formatDate } from "@gd/lib/labels";
import { useI18n } from "@gd/i18n";

export function RequestTable({
  requests,
  emptyMessage,
}: {
  requests: Ticket[];
  emptyMessage?: string;
}) {
  const { locale, t } = useI18n();
  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <p>{emptyMessage ?? t("table.empty")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-wrap desktop-only">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("common.subject")}</th>
              <th>{t("table.requester")}</th>
              <th>{t("common.status")}</th>
              <th>{t("filters.priority")}</th>
              <th>{t("common.date")}</th>
              <th aria-label={t("common.actions")} />
            </tr>
          </thead>
          <tbody>
            {requests.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <Link
                    href={`/gestion-demandes/demandes/${ticket.id}`}
                    className="request-subject-link"
                  >
                    {ticket.subject}
                  </Link>
                </td>
                <td>{ticket.name}</td>
                <td>
                  <StatusBadge status={ticket.status} />
                </td>
                <td>
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="nowrap">{formatDate(ticket.createdAt, locale)}</td>
                <td className="table-actions">
                  <Button
                    href={`/gestion-demandes/demandes/${ticket.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    {t("common.view")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="request-cards mobile-only">
        {requests.map((ticket) => (
          <li key={ticket.id} className="request-card">
            <div className="request-card-top">
              <Link
                href={`/gestion-demandes/demandes/${ticket.id}`}
                className="request-card-title"
              >
                {ticket.subject}
              </Link>
              <span className="muted nowrap">
                {formatDate(ticket.createdAt, locale)}
              </span>
            </div>
            <p className="muted request-card-meta">{ticket.name}</p>
            <div className="request-card-badges">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <Button
              href={`/gestion-demandes/demandes/${ticket.id}`}
              variant="secondary"
              size="sm"
            >
              {t("table.details")}
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
