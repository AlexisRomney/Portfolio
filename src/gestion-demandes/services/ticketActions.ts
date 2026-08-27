import type { Ticket } from "@gd/types/ticket";
import { getTeamMemberById } from "@gd/services/teamMemberService";

export type TicketActionKind =
  | "notify_assignee"
  | "escalate_human"
  | "manual_review";

export type ResolvedTicketAction = {
  action: TicketActionKind;
  target: string;
  targetEmail: string | null;
  assigneeId: string | null;
  status: "pending_send" | "simulated" | "failed";
  executedBy: "trigger.dev";
};

/**
 * Détermine l'action métier à partir des décisions déjà stockées (sans Gemini).
 * L'email cible vient toujours de Neon via assignee_id.
 */
export async function resolveTicketAction(
  ticket: Ticket,
): Promise<ResolvedTicketAction> {
  // Priorité : notifier le collaborateur assigné (même si escalation = true).
  if (ticket.assigneeId) {
    const member = await getTeamMemberById(ticket.assigneeId);
    if (member?.active) {
      return {
        action: "notify_assignee",
        target: member.name,
        targetEmail: member.email,
        assigneeId: member.id,
        status: "pending_send",
        executedBy: "trigger.dev",
      };
    }

    return {
      action: "manual_review",
      target: "human_review",
      targetEmail: null,
      assigneeId: ticket.assigneeId,
      status: "failed",
      executedBy: "trigger.dev",
    };
  }

  if (ticket.escalation === true) {
    return {
      action: "escalate_human",
      target: "human_review",
      targetEmail: null,
      assigneeId: null,
      status: "simulated",
      executedBy: "trigger.dev",
    };
  }

  return {
    action: "manual_review",
    target: "human_review",
    targetEmail: null,
    assigneeId: null,
    status: "failed",
    executedBy: "trigger.dev",
  };
}

/** Logs métier « réussis » (email envoyé ou escalade enregistrée). */
export function isBusinessActionLog(action: string, status: string): boolean {
  if (action === "notify_assignee" && status === "success") return true;
  if (action === "escalate_human" && (status === "simulated" || status === "success")) {
    return true;
  }
  return false;
}

export function isAutomationOutcomeLog(action: string): boolean {
  return (
    action === "notify_assignee" ||
    action === "notify_department" ||
    action === "escalate_human" ||
    action === "manual_review" ||
    action === "send_customer_response"
  );
}
