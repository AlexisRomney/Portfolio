"use client";

import { useState } from "react";
import type { Ticket } from "@gd/types/ticket";
import { Button } from "@gd/components/ui/Button";
import { useTickets } from "@gd/lib/tickets-store";
import { recontrolTicket } from "@gd/services/analyzeRequestClient";
import { InfoTooltip } from "@gd/components/ui/InfoTooltip";
import { hasCurrentAiControl } from "@gd/lib/controlValidity";
import { isLocalControlOutdated } from "@gd/lib/ticket-local-overrides";
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

function hasControl(ticket: Ticket): boolean {
  return (
    hasCurrentAiControl(ticket) &&
    typeof ticket.controlApproved === "boolean" &&
    typeof ticket.controlScore === "number" &&
    Boolean(ticket.controlSummary)
  );
}

function formatScore(score: number): string {
  return `${Math.round(score * 100)} %`;
}

export function AiControlPanel({ ticket }: { ticket: Ticket }) {
  const { upsertTicket } = useTickets();
  const { t, priorityLabel, departmentLabel, translateApiText } = useI18n();
  const [isControlling, setIsControlling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analyzed = hasAnalysis(ticket);
  const controlled = hasControl(ticket);
  const controlOutdated = isLocalControlOutdated(ticket.id);

  async function handleRetry() {
    setIsControlling(true);
    setError(null);

    const result = await recontrolTicket(ticket.id);

    if (!result.ok) {
      setError(result.error);
      setIsControlling(false);
      return;
    }

    upsertTicket(result.ticket);

    if (result.controlError) {
      setError(result.controlError);
    }

    setIsControlling(false);
  }

  if (controlled) {
    const approved = ticket.controlApproved === true;
    const needsReview = ticket.requiresHumanReview === true;
    const issues = ticket.controlIssues ?? [];
    const warnings = ticket.controlWarnings ?? [];

    return (
      <section
        className={`ai-panel ai-control-panel ${approved ? "ai-panel-ready" : "ai-control-panel-review"}`}
        aria-labelledby="ai-control-title"
      >
        <div className="ai-panel-header">
          <div className="ai-panel-title-row">
            <h2 id="ai-control-title">{t("control.title")}</h2>
            <InfoTooltip text={t("control.tooltip")} />
          </div>
          <span className={`ai-chip ${approved ? "" : "ai-chip-warning"}`}>
            {controlOutdated
              ? t("control.local")
              : approved
                ? t("control.validated")
                : t("control.review")}
          </span>
        </div>

        {controlOutdated ? (
          <p className="muted" role="status">
            {t("control.localText")}
          </p>
        ) : null}

        {approved && !needsReview && !controlOutdated ? (
          <ul className="ai-control-checklist">
            <li>{t("control.analysisOk")}</li>
            <li>{t("control.routingOk")}</li>
            <li>{t("control.responseOk")}</li>
          </ul>
        ) : (
          <p className="ai-control-status" role="status">
            {t("control.checkRequired")}
          </p>
        )}

        <div className="ai-result-grid">
          <div className="ai-result-item">
            <span className="meta-label">{t("control.score")}</span>
            <span className="meta-value">
              {formatScore(ticket.controlScore as number)}
            </span>
          </div>
          <div className="ai-result-item">
            <span className="meta-label">{t("common.status")}</span>
            <span className="meta-value">
              {approved ? `✓ ${t("control.validated")}` : `⚠️ ${t("control.review")}`}
            </span>
          </div>
        </div>

        {ticket.controlSummary ? (
          <div className="ai-result-block">
            <h3>{t("control.summary")}</h3>
            <blockquote>{ticket.controlSummary}</blockquote>
          </div>
        ) : null}

        {issues.length > 0 ? (
          <div className="ai-result-block">
            <h3>{t("control.issues")}</h3>
            <ul className="ai-control-list">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {warnings.length > 0 ? (
          <div className="ai-result-block">
            <h3>{t("control.warnings")}</h3>
            <ul className="ai-control-list ai-control-list-warn">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {needsReview ? (
          <div className="ai-result-block">
            <h3>{t("control.recommended")}</h3>
            <blockquote>
              {t("control.human")}
              {ticket.reviewReason ? `: ${ticket.reviewReason}` : ""}
            </blockquote>
          </div>
        ) : null}

        {(ticket.correctedPriority ||
          ticket.correctedDepartment ||
          ticket.correctedAction) && (
          <div className="ai-result-block">
            <h3>{t("control.corrections")}</h3>
            <ul className="ai-control-list">
              {ticket.correctedPriority ? (
                <li>
                  {t("control.priorityCorrection")} : {priorityLabel(ticket.correctedPriority)}
                </li>
              ) : null}
              {ticket.correctedDepartment ? (
                <li>{t("control.departmentCorrection")} : {departmentLabel(ticket.correctedDepartment)}</li>
              ) : null}
              {ticket.correctedAction ? (
                <li>{t("control.actionCorrection")} : {ticket.correctedAction}</li>
              ) : null}
            </ul>
          </div>
        )}

        <div className="ai-panel-actions">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isControlling}
            onClick={handleRetry}
          >
            {isControlling ? t("control.running") : t("control.retry")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="ai-panel" aria-labelledby="ai-control-title">
      <div className="ai-panel-header">
        <div className="ai-panel-title-row">
          <h2 id="ai-control-title">{t("control.title")}</h2>
          <InfoTooltip text={t("control.tooltip")} />
        </div>
        <span className="ai-chip ai-chip-muted">{t("control.notDone")}</span>
      </div>

      {isControlling ? (
        <p className="analyzing-status" role="status">
          <span className="analyzing-spinner" aria-hidden />
          {t("control.decisionRunning")}
        </p>
      ) : (
        <p className="ai-placeholder">
          {analyzed
            ? t("control.failed")
            : t("control.analyzeFirst")}
        </p>
      )}

      {error ? (
        <p className="alert alert-warning" role="alert">
          {translateApiText(error)}
        </p>
      ) : null}

      <div className="ai-panel-actions">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isControlling || !analyzed}
          onClick={handleRetry}
        >
          {isControlling ? t("control.running") : t("control.retry")}
        </Button>
      </div>
    </section>
  );
}
