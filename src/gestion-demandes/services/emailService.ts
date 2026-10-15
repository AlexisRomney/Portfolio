import { Resend } from "resend";
import { consumeDemoEmailQuota } from "@gd/lib/demo-email-quota";
import { isDemoMode } from "@gd/lib/demo-isolation";
import type { Ticket } from "@gd/types/ticket";
import { PRIORITY_LABELS } from "@gd/lib/labels";

export type AssignmentEmailInput = {
  ticket: Ticket;
  assigneeName: string;
  assigneeEmail: string;
};

export type AssignmentEmailResult = {
  ok: true;
  messageId: string;
} | {
  ok: false;
  error: string;
  resendMessage?: string;
};

async function enforceDemoEmailQuota(
  recipientEmail: string,
): Promise<AssignmentEmailResult | null> {
  if (!isDemoMode()) return null;
  const quota = await consumeDemoEmailQuota(recipientEmail);
  if (!quota.ok) {
    return { ok: false, error: quota.error };
  }
  return null;
}

/**
 * Resend n'accepte que : email@exemple.com ou Name <email@exemple.com>.
 * Corrige les formes fréquentes du type "<email@exemple.com>".
 */
function normalizeFromAddress(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const bareBrackets = value.match(/^<([^<>@\s]+@[^<>@\s]+)>$/);
  if (bareBrackets) {
    return bareBrackets[1];
  }

  const named = value.match(/^(.+?)\s*<([^<>@\s]+@[^<>@\s]+)>$/);
  if (named) {
    const name = named[1].trim().replace(/^["']|["']$/g, "");
    const email = named[2];
    return name ? `${name} <${email}>` : email;
  }

  if (/^[^<>@\s]+@[^<>@\s]+$/.test(value)) {
    return value;
  }

  return null;
}

function getResendConfig():
  | { ok: true; apiKey: string; from: string }
  | { ok: false; error: string } {
  // Clé dédiée à l'automatisation Gestion des demandes (distincte du formulaire Contact).
  // Ne jamais réutiliser RESEND_API_KEY (contact portfolio) ici.
  const apiKey = process.env.RESEND_AUTOMATION_API_KEY?.trim();
  const fromRaw = process.env.AUTOMATION_FROM_EMAIL?.trim();

  if (!apiKey) {
    return { ok: false, error: "RESEND_AUTOMATION_NOT_CONFIGURED" };
  }
  if (!fromRaw) {
    return { ok: false, error: "AUTOMATION_FROM_EMAIL_MISSING" };
  }

  const from = normalizeFromAddress(fromRaw);
  if (!from) {
    console.error("[emailService] invalid AUTOMATION_FROM_EMAIL format");
    return { ok: false, error: "AUTOMATION_FROM_EMAIL_INVALID" };
  }

  return { ok: true, apiKey, from };
}

function getAppUrl(): string {
  const raw = process.env.APP_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

function ticketUrl(ticketId: string): string {
  return `${getAppUrl()}/demandes/${ticketId}`;
}

function priorityLabel(priority: Ticket["priority"]): string {
  if (!priority) return "Non définie";
  return PRIORITY_LABELS[priority] ?? priority;
}

/**
 * Envoie l'email interne d'assignation via Resend.
 * Ne jamais appeler depuis le frontend. Ne logue jamais la clé API.
 */
export async function sendTicketAssignmentEmail(
  input: AssignmentEmailInput,
): Promise<AssignmentEmailResult> {
  const quotaBlock = await enforceDemoEmailQuota(input.assigneeEmail);
  if (quotaBlock) return quotaBlock;

  const config = getResendConfig();
  if (!config.ok) {
    return { ok: false, error: config.error };
  }

  const { ticket, assigneeName, assigneeEmail } = input;
  const department = ticket.department ?? "Service";
  const priority = priorityLabel(ticket.priority);
  const subject = `Nouvelle demande attribuée : ${ticket.subject}`;

  const body = [
    `Bonjour ${assigneeName},`,
    "",
    "Une nouvelle demande vous a été assignée.",
    "",
    `Service :`,
    department,
    "",
    `Client :`,
    ticket.name,
    "",
    `Email :`,
    ticket.email,
    "",
    `Sujet :`,
    ticket.subject,
    "",
    `Catégorie :`,
    ticket.category ?? "n/d",
    "",
    `Sous-catégorie :`,
    ticket.subcategory ?? "n/d",
    "",
    `Priorité :`,
    priority,
    "",
    `Résumé :`,
    ticket.summary ?? "n/d",
    "",
    `Action recommandée :`,
    ticket.recommendedAction ?? ticket.action ?? "n/d",
    "",
    `Message du client :`,
    `"${ticket.message}"`,
    "",
    "Vous pouvez consulter la demande depuis l'application :",
    ticketUrl(ticket.id),
    "",
    "Cordialement,",
    "Assistant IA",
  ].join("\n");

  try {
    const resend = new Resend(config.apiKey);
    const result = await resend.emails.send({
      from: config.from,
      to: assigneeEmail,
      subject,
      text: body,
    });

    if (result.error) {
      console.error("[emailService] Email send failed", {
        status: "error",
        name: result.error.name,
        message: result.error.message,
      });
      return {
        ok: false,
        error: "RESEND_SEND_FAILED",
        resendMessage: result.error.message,
      };
    }

    const messageId = result.data?.id;
    if (!messageId) {
      return { ok: false, error: "RESEND_NO_MESSAGE_ID" };
    }

    return { ok: true, messageId };
  } catch (error) {
    console.error("[emailService] Email send failed", {
      status: "exception",
      message: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false, error: "RESEND_SEND_FAILED" };
  }
}

export type CustomerResponseEmailInput = {
  to: string;
  subject: string;
  body: string;
  /** Clé d'idempotence Resend pour un message précis. */
  idempotencyKey?: string;
};

/**
 * Email client : réponse destinée au demandeur (ticket.email).
 * Distinct de l'email interne d'assignation (notify_assignee).
 * Ne jamais appeler depuis le frontend. Ne logue jamais la clé API.
 */
export async function sendCustomerResponseEmail(
  input: CustomerResponseEmailInput,
): Promise<AssignmentEmailResult> {
  const quotaBlock = await enforceDemoEmailQuota(input.to);
  if (quotaBlock) return quotaBlock;

  const config = getResendConfig();
  if (!config.ok) {
    return { ok: false, error: config.error };
  }

  const to = input.to.trim();
  const body = input.body.trim();
  if (!to || !body) {
    return { ok: false, error: "CUSTOMER_RESPONSE_INVALID" };
  }

  try {
    const resend = new Resend(config.apiKey);
    const result = await resend.emails.send({
      from: config.from,
      to,
      subject: input.subject.trim() || "Votre demande",
      text: body,
      ...(input.idempotencyKey
        ? {
            headers: {
              "Idempotency-Key": input.idempotencyKey.slice(0, 256),
            },
          }
        : {}),
    });

    if (result.error) {
      console.error("[emailService] Email send failed", {
        status: "error",
        name: result.error.name,
        message: result.error.message,
      });
      return {
        ok: false,
        error: "RESEND_SEND_FAILED",
        resendMessage: result.error.message,
      };
    }

    const messageId = result.data?.id;
    if (!messageId) {
      return { ok: false, error: "RESEND_NO_MESSAGE_ID" };
    }

    return { ok: true, messageId };
  } catch (error) {
    console.error("[emailService] Email send failed", {
      status: "exception",
      message: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false, error: "RESEND_SEND_FAILED" };
  }
}

export type AiAlertEmailInput = {
  to: string;
  subject: string;
  body: string;
  idempotencyKey: string;
};

/**
 * Alerte interne IA via Resend. L'adresse destinataire reste côté serveur.
 * Une erreur d'alerte est retournée, jamais propagée au workflow IA.
 */
export async function sendAiAlertEmail(
  input: AiAlertEmailInput,
): Promise<AssignmentEmailResult> {
  const quotaBlock = await enforceDemoEmailQuota(input.to);
  if (quotaBlock) return quotaBlock;

  const config = getResendConfig();
  if (!config.ok) {
    return { ok: false, error: config.error };
  }

  const to = input.to.trim();
  if (!to || !input.subject.trim() || !input.body.trim()) {
    return { ok: false, error: "AI_ALERT_EMAIL_INVALID" };
  }

  try {
    const resend = new Resend(config.apiKey);
    const result = await resend.emails.send({
      from: config.from,
      to,
      subject: input.subject.trim(),
      text: input.body.trim(),
      headers: {
        "Idempotency-Key": input.idempotencyKey.slice(0, 256),
      },
    });

    if (result.error) {
      return {
        ok: false,
        error: "RESEND_SEND_FAILED",
        resendMessage: result.error.message,
      };
    }

    const messageId = result.data?.id;
    if (!messageId) {
      return { ok: false, error: "RESEND_NO_MESSAGE_ID" };
    }
    return { ok: true, messageId };
  } catch {
    return { ok: false, error: "RESEND_SEND_FAILED" };
  }
}
