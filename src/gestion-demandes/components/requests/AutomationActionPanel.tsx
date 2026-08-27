"use client";

import { useEffect, useState } from "react";
import { Button } from "@gd/components/ui/Button";
import { InfoTooltip } from "@gd/components/ui/InfoTooltip";
import { formatDateTime } from "@gd/lib/labels";
import { useTickets } from "@gd/lib/tickets-store";
import { runTicketAutomation } from "@gd/services/analyzeRequestClient";
import type { AutomationLog } from "@gd/services/automationLogService";
import type { Ticket } from "@gd/types/ticket";
import { useI18n } from "@gd/i18n";

type ActionStatus = "done" | "failed" | "waiting";

type ActionPresentation = {
  label: string;
  done: string;
  failed: string;
  waiting: string;
};

function actionStatus(status: string): ActionStatus {
  if (status === "failed") return "failed";
  if (status === "pending" || status === "pending_send") return "waiting";
  return "done";
}

function actionGroup(action: string): string {
  if (action === "notify_assignee" || action === "notify_department") {
    return "assignment";
  }
  if (action === "escalate_human" || action === "manual_review") {
    return "human-review";
  }
  return action;
}

/**
 * Une condition de déclenchement non réunie (revue manuelle en échec) n'est pas
 * une action exécutée : elle ne doit pas apparaître dans le journal.
 */
function isExecutedAction(log: AutomationLog): boolean {
  return !(log.action === "manual_review" && log.status === "failed");
}

/**
 * Une même action peut être journalisée plusieurs fois pendant son exécution
 * (mise en attente puis résultat) : seule la dernière entrée d'une même série
 * décrit l'état réel.
 */
function dedupeConsecutive(logs: AutomationLog[]): AutomationLog[] {
  return logs.filter((log, index) => {
    const next = logs[index + 1];
    return !next || actionGroup(next.action) !== actionGroup(log.action);
  });
}

function ticketAutomationPhase(
  status: string | null | undefined,
): "pending" | "processing" | "completed" | "failed" | null {
  if (status === "pending") return "pending";
  if (status === "processing") return "processing";
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  return null;
}

type Props = {
  ticket: Ticket;
};

export function AutomationActionPanel({ ticket }: Props) {
  const { upsertTicket } = useTickets();
  const { locale, t, translateApiText } = useI18n();
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [liveTicket, setLiveTicket] = useState(ticket);

  useEffect(() => {
    setLiveTicket(ticket);
  }, [ticket]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function loadOnce() {
      try {
        const response = await fetch(`/gestion-demandes/api/tickets/${ticket.id}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as {
          ticket?: Ticket;
          automationLogs?: AutomationLog[];
          error?: string;
        };
        if (cancelled) return null;
        if (!response.ok) {
          setError(
            data.error
              ? translateApiText(data.error)
              : translateApiText("Impossible de charger l'automatisation."),
          );
          return null;
        }
        if (data.ticket) {
          upsertTicket(data.ticket);
          setLiveTicket(data.ticket);
        }
        setLogs(data.automationLogs ?? []);
        setError(null);
        return data.ticket ?? null;
      } catch {
        if (!cancelled) {
          setError(translateApiText("Impossible de charger l'automatisation."));
        }
        return null;
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function run() {
      const current = await loadOnce();
      if (cancelled) return;

      const phase = ticketAutomationPhase(current?.automationStatus);
      // Poll tant que Trigger a été mis en file / est en cours.
      if (phase === "pending" || phase === "processing") {
        timer = setTimeout(() => {
          void run();
        }, 2000);
      }
    }

    void run();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [ticket.id, translateApiText, upsertTicket]);

  async function handleTestAutomation() {
    setRunning(true);
    setError(null);
    setInfo(null);

    const result = await runTicketAutomation(ticket.id);
    if (!result.ok) {
      setError(translateApiText(result.error));
      setRunning(false);
      return;
    }

    upsertTicket(result.ticket);
    setLiveTicket(result.ticket);

    // process-ticket est asynchrone : on attend brièvement le log métier.
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const response = await fetch(`/gestion-demandes/api/tickets/${ticket.id}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        ticket?: Ticket;
        automationLogs?: AutomationLog[];
      };
      if (data.ticket) {
        upsertTicket(data.ticket);
        setLiveTicket(data.ticket);
      }
      if (data.automationLogs?.length) {
        setLogs(data.automationLogs);
        setInfo(t("automation.executed"));
        setRunning(false);
        return;
      }
      if (
        data.ticket?.processedBy ||
        data.ticket?.automationStatus === "completed" ||
        data.ticket?.automationStatus === "failed"
      ) {
        setInfo(
          data.ticket.automationStatus === "failed"
            ? t("automation.statusFailed")
            : t("automation.already"),
        );
        setLogs(data.automationLogs ?? []);
        setRunning(false);
        return;
      }
    }

    setInfo(t("automation.triggered"));
    setRunning(false);
  }

  const canTest =
    liveTicket.controlApproved === true &&
    liveTicket.requiresHumanReview !== true;
  const executedLogs = dedupeConsecutive(logs.filter(isExecutedAction));
  const phase = ticketAutomationPhase(liveTicket.automationStatus);
  const localizedPresentation = (log: AutomationLog): ActionPresentation => {
    if (log.action === "notify_assignee" || log.action === "notify_department") {
      return {
        label: t("automation.assigned"),
        done: t("automation.assignedDone"),
        failed: t("automation.assignedFailed"),
        waiting: t("automation.assignedWaiting"),
      };
    }
    if (log.action === "escalate_human" || log.action === "manual_review") {
      return {
        label: t("automation.human"),
        done: t("automation.humanDone"),
        failed: t("automation.humanFailed"),
        waiting: t("automation.humanWaiting"),
      };
    }
    if (log.action === "send_customer_response") {
      return {
        label: t("automation.responseSent"),
        done: t("automation.responseDone"),
        failed: t("automation.responseFailed"),
        waiting: t("automation.responseWaiting"),
      };
    }
    return {
      label: t("automation.action"),
      done: t("automation.actionDone"),
      failed: t("automation.actionFailed"),
      waiting: t("automation.actionWaiting"),
    };
  };

  const statusChip =
    phase === "pending"
      ? t("automation.chipPending")
      : phase === "processing"
        ? t("automation.chipProcessing")
        : phase === "completed"
          ? t("automation.chipCompleted")
          : phase === "failed"
            ? t("automation.chipFailed")
            : executedLogs.length === 0
              ? t("automation.none")
              : null;

  const emptyMessage =
    phase === "pending"
      ? t("automation.statusPending")
      : phase === "processing"
        ? t("automation.statusProcessing")
        : phase === "failed"
          ? t("automation.statusFailed")
          : phase === "completed"
            ? t("automation.statusCompleted")
            : t("automation.noLog");

  return (
    <section
      className="ai-panel automation-action-panel"
      aria-labelledby="automation-action-title"
    >
      <div className="ai-panel-header">
        <div className="ai-panel-title-row">
          <h2 id="automation-action-title">{t("automation.title")}</h2>
          <InfoTooltip text={t("automation.tooltip")} />
        </div>
        {!loading && statusChip ? (
          <span
            className={`ai-chip${
              phase === "pending" || phase === "processing"
                ? " ai-chip-warning"
                : " ai-chip-muted"
            }`}
          >
            {statusChip}
          </span>
        ) : null}
      </div>

      {loading ? (
        <p className="muted">{t("common.loading")}</p>
      ) : executedLogs.length > 0 ? (
        <ol className="automation-action-list">
          {executedLogs.map((log) => (
            <li className="automation-action-entry" key={log.id}>
              <h3>{localizedPresentation(log).label}</h3>
              <p className="automation-action-date">
                {t("automation.executedAt")}{" "}
                <time dateTime={log.executedAt}>
                  {formatDateTime(log.executedAt, locale).replace(
                    /\s(?=\d{2}:\d{2}$)/,
                    " · ",
                  )}
                </time>
              </p>
              <p className="automation-action-status">
                {t("common.status")} :{" "}
                <strong>
                  {actionStatus(log.status) === "done"
                    ? t("common.completed")
                    : actionStatus(log.status) === "failed"
                      ? t("automation.failed")
                      : t("automation.waiting")}
                </strong>
              </p>
              <blockquote>
                {localizedPresentation(log)[actionStatus(log.status)]}
              </blockquote>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">{emptyMessage}</p>
      )}

      {error ? <p className="form-error">{error}</p> : null}
      {info ? <p className="muted">{info}</p> : null}

      {canTest ? (
        <div className="ai-panel-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleTestAutomation()}
            disabled={running}
          >
            {running ? t("automation.running") : t("automation.test")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
