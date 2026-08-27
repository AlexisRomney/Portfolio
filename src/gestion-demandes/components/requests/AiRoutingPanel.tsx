"use client";

import { useState } from "react";
import type { Ticket } from "@gd/types/ticket";
import { Button } from "@gd/components/ui/Button";
import { useTickets } from "@gd/lib/tickets-store";
import { rerouteTicket } from "@gd/services/analyzeRequestClient";
import { InfoTooltip } from "@gd/components/ui/InfoTooltip";
import {
  EditableAssigneeField,
  EditableDepartmentField,
  TicketOwnerField,
  useActiveTeamMembers,
} from "@gd/components/requests/TicketInlineFields";
import { isLocalRoutingOutdated } from "@gd/lib/ticket-local-overrides";
import { useI18n } from "@gd/i18n";

function hasAnalysis(ticket: Ticket): boolean {
  return Boolean(
    ticket.category &&
      ticket.priority &&
      ticket.sentiment &&
      ticket.summary &&
      ticket.action,
  );
}

function hasRouting(ticket: Ticket): boolean {
  return Boolean(
    ticket.department &&
      ticket.assigneeType &&
      ticket.routingReason &&
      ticket.recommendedAction &&
      typeof ticket.escalation === "boolean",
  );
}

export function AiRoutingPanel({ ticket }: { ticket: Ticket }) {
  const { upsertTicket } = useTickets();
  const { t, translateApiText } = useI18n();
  const [isRouting, setIsRouting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const members = useActiveTeamMembers();
  const analyzed = hasAnalysis(ticket);
  const routed = hasRouting(ticket);
  const routingOutdated = isLocalRoutingOutdated(ticket.id);

  async function handleRetry() {
    setIsRouting(true);
    setError(null);

    const result = await rerouteTicket(ticket.id);

    if (!result.ok) {
      setError(result.error);
      setIsRouting(false);
      return;
    }

    upsertTicket(result.ticket);

    if (result.routingError) {
      setError(result.routingError);
    }

    setIsRouting(false);
  }

  if (routed) {
    return (
      <div className="routing-block" aria-labelledby="ai-routing-title">
        <div className="ai-panel-header">
          <div className="ai-panel-title-row">
            <h2 id="ai-routing-title">{t("routing.title")}</h2>
            <InfoTooltip text={t("routing.tooltip")} />
          </div>
          <span className={`ai-chip ${routingOutdated ? "ai-chip-muted" : ""}`}>
            {routingOutdated ? t("routing.local") : t("routing.decided")}
          </span>
        </div>

        {routingOutdated ? (
          <p className="muted" role="status">
            {t("routing.localText")}
          </p>
        ) : null}

        <div className="ai-result-grid">
          <EditableDepartmentField ticket={ticket} members={members} />

          <EditableAssigneeField ticket={ticket} members={members} />

          <TicketOwnerField ticket={ticket} />

          <div className="ai-result-item">
            <span className="meta-label">{t("routing.escalation")}</span>
            <span
              className={`badge ${ticket.escalation ? "badge-escalation-yes" : "badge-escalation-no"}`}
            >
              {ticket.escalation ? t("routing.yes") : t("routing.no")}
            </span>
          </div>
        </div>

        {ticket.escalation && ticket.escalationReason ? (
          <div className="ai-result-block">
            <h3>{t("routing.escalationReason")}</h3>
            <blockquote>{ticket.escalationReason}</blockquote>
          </div>
        ) : null}

        {ticket.routingReason ? (
          <div className="ai-result-block">
            <h3>{t("routing.reason")}</h3>
            <blockquote>{ticket.routingReason}</blockquote>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="routing-block" aria-labelledby="ai-routing-title">
      <div className="ai-panel-header">
        <div className="ai-panel-title-row">
          <h2 id="ai-routing-title">{t("routing.title")}</h2>
          <InfoTooltip text={t("routing.tooltip")} />
        </div>
        <span className="ai-chip ai-chip-muted">{t("routing.notDone")}</span>
      </div>

      {isRouting ? (
        <p className="analyzing-status" role="status">
          <span className="analyzing-spinner" aria-hidden />
          {t("routing.running")}
        </p>
      ) : (
        <p className="ai-placeholder">
          {analyzed
            ? t("routing.failed")
            : t("routing.analyzeFirst")}
        </p>
      )}

      {error ? (
        <p className="alert alert-warning" role="alert">
          {translateApiText(error)}
        </p>
      ) : null}

      <div className="ai-result-grid">
        <EditableDepartmentField ticket={ticket} members={members} />
        <EditableAssigneeField ticket={ticket} members={members} />
        <TicketOwnerField ticket={ticket} />
      </div>

      <div className="ai-panel-actions">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isRouting || !analyzed}
          onClick={handleRetry}
        >
          {isRouting ? t("routing.retrying") : t("routing.retry")}
        </Button>
      </div>
    </div>
  );
}
