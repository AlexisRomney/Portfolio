import { idempotencyKeys, tasks } from "@trigger.dev/sdk";
import type { processTicketTask } from "../trigger/process-ticket";
import { isAutoSendCustomerResponseAllowed } from "@gd/lib/autoSendPolicy";
import { hasCurrentAiControl } from "@gd/lib/controlValidity";
import { isDemoMode } from "@gd/lib/demo-isolation";
import { getAppSettings } from "@gd/services/appSettingsService";
import { updateTicket } from "@gd/services/ticketService";
import type { Ticket } from "@gd/types/ticket";

export type TriggerProcessTicketResult = {
  triggered: boolean;
  runId?: string;
  skippedReason?:
    | "not_eligible"
    | "already_processed"
    | "control_not_approved"
    | "human_review_required"
    | "trigger_not_configured";
  error?: string;
};

/**
 * Détermine si un ticket persisté peut démarrer l'automatisation Trigger.dev.
 */
export function shouldTriggerProcessTicket(ticket: Ticket): boolean {
  if (ticket.automationStatus === "completed" || ticket.processedBy) {
    return false;
  }
  if (ticket.status === "resolved") {
    return false;
  }
  if (!hasCurrentAiControl(ticket)) {
    return false;
  }
  if (ticket.controlApproved !== true) {
    return false;
  }
  if (ticket.requiresHumanReview === true) {
    return false;
  }
  return true;
}

function skipReason(ticket: Ticket): TriggerProcessTicketResult["skippedReason"] {
  if (ticket.automationStatus === "completed" || ticket.processedBy) {
    return "already_processed";
  }
  if (ticket.status === "resolved") {
    return "already_processed";
  }
  if (ticket.requiresHumanReview === true) {
    return "human_review_required";
  }
  if (!hasCurrentAiControl(ticket)) {
    return "control_not_approved";
  }
  if (ticket.controlApproved !== true) {
    return "control_not_approved";
  }
  return "not_eligible";
}

/**
 * Déclenche `process-ticket` après persistance Neon, sans bloquer sur l'exécution.
 * Les erreurs de déclenchement sont journalisées et n'annulent pas le ticket.
 */
export async function triggerProcessTicketIfEligible(
  ticket: Ticket,
): Promise<TriggerProcessTicketResult> {
  // Démo publique : ne jamais déclencher Trigger sur un ticket hors démo.
  if (isDemoMode() && !ticket.isDemo) {
    return { triggered: false, skippedReason: "not_eligible" };
  }

  const settings = await getAppSettings().catch(() => null);
  const autoSendPending = settings
    ? isAutoSendCustomerResponseAllowed(ticket, settings)
    : false;

  if (!shouldTriggerProcessTicket(ticket) && !autoSendPending) {
    return { triggered: false, skippedReason: skipReason(ticket) };
  }

  const secret = process.env.TRIGGER_SECRET_KEY?.trim().replace(
    /^["']|["']$/g,
    "",
  );
  if (!secret) {
    console.error(
      "[analyze-request] TRIGGER_SECRET_KEY manquante — automation non déclenchée",
      { ticketId: ticket.id },
    );
    return { triggered: false, skippedReason: "trigger_not_configured" };
  }

  try {
    const idempotencyKey = await idempotencyKeys.create(
      `process-ticket:${ticket.id}`,
      { scope: "global" },
    );

    const handle = await tasks.trigger<typeof processTicketTask>(
      "process-ticket",
      { ticketId: ticket.id },
      {
        idempotencyKey,
        idempotencyKeyTTL: "15m",
        concurrencyKey: ticket.id,
      },
    );

    console.info("[analyze-request] process-ticket déclenché", {
      ticketId: ticket.id,
      runId: handle.id,
    });

    // Statut visible immédiatement : le job est en file, l'exécution est async.
    // `claimTicketAutomation` accepte encore `pending` → `processing`.
    await updateTicket(ticket.id, { automationStatus: "pending" }).catch(
      (error) => {
        console.error(
          "[analyze-request] impossible de marquer automation pending",
          {
            ticketId: ticket.id,
            message: error instanceof Error ? error.message : "unknown",
          },
        );
      },
    );

    return { triggered: true, runId: handle.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "TRIGGER_ERROR";
    console.error("[analyze-request] échec déclenchement process-ticket", {
      ticketId: ticket.id,
      message,
    });
    await updateTicket(ticket.id, { automationStatus: "failed" }).catch(() => {});
    return { triggered: false, error: message };
  }
}
