"use client";

import { useState } from "react";
import { Button } from "@gd/components/ui/Button";
import { InfoTooltip } from "@gd/components/ui/InfoTooltip";
import { useTickets } from "@gd/lib/tickets-store";
import { reanalyzeTicket } from "@gd/services/analyzeRequestClient";
import type { Ticket } from "@gd/types/ticket";
import {
  EditableCategoryField,
  EditablePriorityField,
  EditableStatusField,
} from "@gd/components/requests/TicketInlineFields";
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

function informationLines(items: string[]): string[] {
  return items.flatMap((item) =>
    item
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/^-\s*/, ""))
      .filter(Boolean),
  );
}

/** Informations du ticket et résultat d'analyse réunis dans la carte principale. */
export function TicketAnalysisSection({ ticket }: { ticket: Ticket }) {
  const { upsertTicket } = useTickets();
  const { locale, t, sentimentLabel, statusLabel, translateApiText } = useI18n();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analyzed = hasAnalysis(ticket);

  async function handleRetry() {
    setIsAnalyzing(true);
    setError(null);

    const result = await reanalyzeTicket(ticket.id, locale);
    if (!result.ok) {
      setError(result.error);
      setIsAnalyzing(false);
      return;
    }

    upsertTicket(result.ticket);
    setError(
      result.analysisError ||
        result.routingError ||
        result.responseError ||
        result.controlError ||
        null,
    );
    setIsAnalyzing(false);
  }

  return (
    <section
      className="ticket-analysis-section"
      aria-labelledby="ticket-analysis-title"
    >
      <div className="ai-panel-header">
        <div className="ai-panel-title-row">
          <h2 id="ticket-analysis-title">{t("analysis.title")}</h2>
          <InfoTooltip text={t("analysis.tooltip")} />
        </div>
        <span className={`ai-chip${analyzed ? "" : " ai-chip-muted"}`}>
          {analyzed ? t("common.completed") : t("common.notDone")}
        </span>
      </div>

      <div className="detail-meta ticket-analysis-meta">
        <EditableStatusField ticket={ticket} />
        <div className="meta-item">
          <span className="meta-label">{t("analysis.phase")}</span>
          <span className="meta-value">
            {ticket.responseSent
              ? t("lifecycle.sent")
              : ticket.status === "resolved"
                ? statusLabel("resolved")
                : ticket.escalation
                  ? t("lifecycle.escalated")
                  : ticket.aiResponse?.trim()
                    ? t("lifecycle.prepared")
                    : ticket.assigneeId || ticket.assigneeName
                      ? t("lifecycle.assigned")
                      : statusLabel(ticket.status)}
          </span>
        </div>
        <EditablePriorityField ticket={ticket} />
        <EditableCategoryField ticket={ticket} />
        <div className="meta-item">
          <span className="meta-label">{t("analysis.subcategory")}</span>
          <span className="meta-value">{ticket.subcategory ?? t("common.undefinedF")}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">{t("analysis.sentiment")}</span>
          <span className="meta-value">
            {ticket.sentiment
              ? sentimentLabel(ticket.sentiment)
              : t("common.undefined")}
          </span>
        </div>
      </div>

      {analyzed ? (
        <>
          <div className="ai-result-block">
            <h3>{t("analysis.summary")}</h3>
            <blockquote>{ticket.summary}</blockquote>
          </div>
          <div className="ai-result-block">
            <h3>{t("analysis.action")}</h3>
            <blockquote>{ticket.action}</blockquote>
          </div>
          {ticket.usefulInformation && ticket.usefulInformation.length > 0 ? (
            <div className="ai-result-block">
              <h3>{t("analysis.keyInfo")}</h3>
              <ul className="useful-info-list">
                {informationLines(ticket.usefulInformation).map((item, index) => (
                  <li key={`${index}-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <p className="ai-placeholder">
            {isAnalyzing
              ? t("form.analyzing")
              : t("analysis.pending")}
          </p>
          <div className="ai-panel-actions">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isAnalyzing}
              onClick={() => void handleRetry()}
            >
              {isAnalyzing ? t("analysis.running") : t("analysis.retry")}
            </Button>
          </div>
        </>
      )}

      {error ? (
        <p className="alert alert-warning" role="alert">
          {translateApiText(error)}
        </p>
      ) : null}

    </section>
  );
}
