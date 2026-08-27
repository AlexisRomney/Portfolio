import { logger, task } from "@trigger.dev/sdk";
import { isAutoSendCustomerResponseAllowed } from "@gd/lib/autoSendPolicy";
import { hasCurrentAiControl } from "@gd/lib/controlValidity";
import { isDemoMode } from "@gd/lib/demo-isolation";
import { getAppSettings } from "@gd/services/appSettingsService";
import {
  createAutomationLog,
  hasBusinessAutomationLog,
} from "@gd/services/automationLogService";
import { sendCustomerResponse } from "@gd/services/customerResponseService";
import { sendTicketAssignmentEmail } from "@gd/services/emailService";
import {
  resolveTicketAction,
  type TicketActionKind,
} from "@gd/services/ticketActions";
import {
  claimTicketAutomation,
  getTicketById,
  updateTicket,
} from "@gd/services/ticketService";

export type ProcessTicketPayload = {
  ticketId: string;
};

export type ProcessTicketResult =
  | {
      success: true;
      ticketId: string;
      action: TicketActionKind | "process_ticket" | "send_customer_response";
      target?: string;
      status: "completed" | "success" | "simulated";
      alreadyProcessed?: boolean;
      messageId?: string;
      customerResponseSent?: boolean;
    }
  | {
      success: false;
      ticketId: string;
      reason:
        | "human_review_required"
        | "control_not_approved"
        | "manual_review"
        | "email_failed";
      action?: TicketActionKind | "send_customer_response";
      target?: string;
    };

function isAlreadyProcessed(ticket: {
  status: string;
  automationStatus: string | null;
  processedBy: string | null;
}): boolean {
  if (ticket.processedBy) return true;
  if (ticket.automationStatus === "completed") return true;
  if (ticket.status === "resolved") return true;
  return false;
}

async function maybeSendCustomerResponse(ticketId: string): Promise<boolean> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;

  const settings = await getAppSettings();
  if (!isAutoSendCustomerResponseAllowed(ticket, settings)) {
    return false;
  }

  logger.info("process-ticket auto-send customer response", { ticketId });

  const result = await sendCustomerResponse({
    ticketId,
    responseBody: ticket.aiResponse ?? "",
    mode: "automatic",
    executedBy: "trigger.dev",
  });

  if (!result.ok) {
    logger.info("process-ticket customer response failed", {
      ticketId,
      error: result.error,
    });
    return false;
  }

  if (result.alreadySent) {
    logger.info("process-ticket customer response already sent", { ticketId });
    return true;
  }

  logger.info("process-ticket customer response sent", {
    ticketId,
    messageId: result.messageId,
  });
  return true;
}

/**
 * Automatisation métier Trigger.dev :
 * récupère l'assignation Neon, envoie l'email Resend (si applicable), journalise.
 * L'envoi client (send_customer_response) est distinct de notify_assignee.
 */
export const processTicketTask = task({
  id: "process-ticket",
  retry: {
    maxAttempts: 1,
  },
  run: async (payload: ProcessTicketPayload): Promise<ProcessTicketResult> => {
    const ticketId = payload.ticketId?.trim();
    if (!ticketId) {
      throw new Error("PROCESS_TICKET_INVALID_INPUT: ticketId is required");
    }

    logger.info("process-ticket started", { ticketId });

    let ticket = await getTicketById(ticketId);
    if (!ticket) {
      throw new Error(`PROCESS_TICKET_NOT_FOUND: ticket ${ticketId} does not exist`);
    }

    if (isDemoMode() && !ticket.isDemo) {
      logger.warn("process-ticket refused: non-demo ticket in demo mode", {
        ticketId,
      });
      await createAutomationLog({
        ticketId,
        action: "process_ticket",
        status: "skipped",
        executedBy: "trigger.dev",
        error: "demo_non_demo_ticket_blocked",
      });
      return {
        success: false,
        ticketId,
        reason: "manual_review",
      };
    }

    const assigneeDone =
      isAlreadyProcessed(ticket) || (await hasBusinessAutomationLog(ticketId));

    if (assigneeDone) {
      logger.info("process-ticket assignee already processed", { ticketId });
      const customerResponseSent = await maybeSendCustomerResponse(ticketId);
      return {
        success: true,
        ticketId,
        action: customerResponseSent ? "send_customer_response" : "process_ticket",
        status: "completed",
        alreadyProcessed: true,
        customerResponseSent,
      };
    }

    if (ticket.requiresHumanReview === true) {
      await createAutomationLog({
        ticketId,
        action: "process_ticket",
        status: "skipped",
        executedBy: "trigger.dev",
        error: "human_review_required",
      });
      return {
        success: false,
        ticketId,
        reason: "human_review_required",
      };
    }

    if (!hasCurrentAiControl(ticket) || ticket.controlApproved !== true) {
      await createAutomationLog({
        ticketId,
        action: "process_ticket",
        status: "skipped",
        executedBy: "trigger.dev",
        error: "control_not_approved",
      });
      return {
        success: false,
        ticketId,
        reason: "control_not_approved",
      };
    }

    // Réservation atomique : ferme la fenêtre entre la lecture ci-dessus et
    // l'action si un nouveau contrôle invalide l'ancien entre-temps.
    const claimed = await claimTicketAutomation(ticketId);
    if (!claimed) {
      const latest = await getTicketById(ticketId);
      if (
        latest &&
        (isAlreadyProcessed(latest) ||
          latest.automationStatus === "processing" ||
          (await hasBusinessAutomationLog(ticketId)))
      ) {
        logger.info("process-ticket claim lost to concurrent run", { ticketId });
        const customerResponseSent = await maybeSendCustomerResponse(ticketId);
        return {
          success: true,
          ticketId,
          action: customerResponseSent
            ? "send_customer_response"
            : "process_ticket",
          status: "completed",
          alreadyProcessed: true,
          customerResponseSent,
        };
      }

      await createAutomationLog({
        ticketId,
        action: "process_ticket",
        status: "skipped",
        executedBy: "trigger.dev",
        error: "control_not_approved",
      });
      return {
        success: false,
        ticketId,
        reason: "control_not_approved",
      };
    }
    ticket = claimed;

    const resolved = await resolveTicketAction(ticket);
    const processedAt = new Date().toISOString();

    if (resolved.action === "manual_review") {
      await updateTicket(ticketId, {
        status: "in_progress",
        automationStatus: "failed",
        assigneeType: "human_review",
      });
      await createAutomationLog({
        ticketId,
        action: "manual_review",
        status: "failed",
        target: resolved.target,
        executedBy: "trigger.dev",
        error: "missing_or_invalid_assignee",
      });
      await maybeSendCustomerResponse(ticketId);
      return {
        success: false,
        ticketId,
        reason: "manual_review",
        action: "manual_review",
        target: resolved.target,
      };
    }

    if (resolved.action === "escalate_human") {
      await updateTicket(ticketId, {
        status: "in_progress",
        processedBy: "trigger.dev",
        processedAt,
        automationStatus: "completed",
        assigneeType: "human_review",
        assigneeId: null,
        assigneeName: null,
      });
      await createAutomationLog({
        ticketId,
        action: "escalate_human",
        status: "simulated",
        target: "human_review",
        executedBy: "trigger.dev",
      });
      const customerResponseSent = await maybeSendCustomerResponse(ticketId);
      return {
        success: true,
        ticketId,
        action: "escalate_human",
        target: "human_review",
        status: "simulated",
        customerResponseSent,
      };
    }

    // notify_assignee → email interne
    if (!resolved.targetEmail) {
      await updateTicket(ticketId, { automationStatus: "failed" });
      await createAutomationLog({
        ticketId,
        action: "notify_assignee",
        status: "failed",
        target: resolved.target,
        executedBy: "trigger.dev",
        error: "missing_assignee_email",
      });
      await maybeSendCustomerResponse(ticketId);
      return {
        success: false,
        ticketId,
        reason: "email_failed",
        action: "notify_assignee",
        target: resolved.target,
      };
    }

    const emailResult = await sendTicketAssignmentEmail({
      ticket,
      assigneeName: resolved.target,
      assigneeEmail: resolved.targetEmail,
    });

    if (!emailResult.ok) {
      await updateTicket(ticketId, {
        status: "in_progress",
        automationStatus: "failed",
      });
      await createAutomationLog({
        ticketId,
        action: "notify_assignee",
        status: "failed",
        target: resolved.target,
        recipient: resolved.targetEmail,
        executedBy: "trigger.dev",
        error: emailResult.error,
      });
      logger.info("process-ticket email failed", {
        ticketId,
        error: emailResult.error,
      });
      await maybeSendCustomerResponse(ticketId);
      return {
        success: false,
        ticketId,
        reason: "email_failed",
        action: "notify_assignee",
        target: resolved.target,
      };
    }

    await updateTicket(ticketId, {
      status: "in_progress",
      processedBy: "trigger.dev",
      processedAt,
      automationStatus: "completed",
      assigneeName: resolved.target,
    });

    await createAutomationLog({
      ticketId,
      action: "notify_assignee",
      status: "success",
      target: resolved.target,
      recipient: resolved.targetEmail,
      messageId: emailResult.messageId,
      executedBy: "trigger.dev",
    });

    logger.info("process-ticket email sent", {
      ticketId,
      target: resolved.target,
      messageId: emailResult.messageId,
    });

    const customerResponseSent = await maybeSendCustomerResponse(ticketId);

    return {
      success: true,
      ticketId,
      action: "notify_assignee",
      target: resolved.target,
      status: "success",
      messageId: emailResult.messageId,
      customerResponseSent,
    };
  },
});
