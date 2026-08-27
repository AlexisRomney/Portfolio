"use client";

import type { TicketPriority, TicketStatus } from "@gd/types/ticket";
import { useI18n } from "@gd/i18n";

const priorityClass: Record<TicketPriority, string> = {
  high: "badge-urgent",
  medium: "badge-normal",
  low: "badge-low",
};

const statusClass: Record<TicketStatus, string> = {
  new: "badge-status-new",
  pending: "badge-status-pending",
  in_progress: "badge-status-progress",
  resolved: "badge-status-resolved",
};

export function PriorityBadge({
  priority,
}: {
  priority: TicketPriority | null;
}) {
  const { t, priorityLabel } = useI18n();
  if (!priority) {
    return <span className="badge badge-status-pending">{t("common.undefinedF")}</span>;
  }

  return (
    <span className={`badge ${priorityClass[priority]}`}>
      <span className="badge-dot" aria-hidden />
      {priorityLabel(priority)}
    </span>
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const { statusLabel } = useI18n();
  return (
    <span className={`badge ${statusClass[status]}`}>
      {statusLabel(status)}
    </span>
  );
}
