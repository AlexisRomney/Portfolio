import { isAutoSendCustomerResponseAllowed } from "@gd/lib/autoSendPolicy";
import { createAutomationLog } from "@gd/services/automationLogService";
import { getAppSettings } from "@gd/services/appSettingsService";
import { sendCustomerResponseEmail } from "@gd/services/emailService";
import {
  claimOutboundMessageSend,
  getSentOutboundByContent,
  markOutboundMessageSent,
  revertOutboundMessageClaim,
} from "@gd/services/ticketMessageService";
import {
  getTicketById,
  updateTicket,
} from "@gd/services/ticketService";
import type { Ticket } from "@gd/types/ticket";
import { createHash } from "node:crypto";

export type SendCustomerResponseInput = {
  ticketId: string;
  responseBody: string;
  mode: "manual" | "automatic";
  executedBy: string;
  /** Clé stable côté client pour l'idempotence d'un envoi précis. */
  sendKey?: string;
};

export type SendCustomerResponseResult =
  | {
      ok: true;
      ticket: Ticket;
      messageId: string;
      alreadySent?: boolean;
    }
  | {
      ok: false;
      error: string;
      status: number;
      ticket?: Ticket;
    };

function userFacingEmailError(
  code: string,
  resendMessage?: string,
): string {
  switch (code) {
    case "RESEND_NOT_CONFIGURED":
    case "RESEND_AUTOMATION_NOT_CONFIGURED":
      return "L'envoi d'email n'est pas configuré. Ajoutez RESEND_AUTOMATION_API_KEY côté serveur.";
    case "AUTOMATION_FROM_EMAIL_MISSING":
      return "L'adresse d'expéditeur est manquante. Configurez AUTOMATION_FROM_EMAIL.";
    case "AUTOMATION_FROM_EMAIL_INVALID":
      return "L'adresse d'expéditeur est invalide. Utilisez email@exemple.com ou Nom <email@exemple.com>.";
    case "RESEND_SEND_FAILED":
      if (resendMessage?.toLowerCase().includes("from")) {
        return "L'adresse d'expéditeur est refusée par Resend. Vérifiez AUTOMATION_FROM_EMAIL.";
      }
      return resendMessage
        ? `L'envoi de la réponse a échoué : ${resendMessage}`
        : "L'envoi de la réponse a échoué. Veuillez réessayer.";
    case "RESEND_NO_MESSAGE_ID":
      return "L'envoi de la réponse a échoué. Veuillez réessayer.";
    default:
      return "L'envoi de la réponse a échoué. Veuillez réessayer.";
  }
}

function stableSendKey(
  ticketId: string,
  mode: "manual" | "automatic",
  body: string,
  explicit?: string,
): string {
  const trimmed = explicit?.trim();
  if (trimmed) return trimmed.slice(0, 120);
  const digest = createHash("sha256")
    .update(`${ticketId}\n${mode}\n${body}`)
    .digest("hex")
    .slice(0, 32);
  return `${mode}:${ticketId}:${digest}`;
}

/**
 * Envoie la réponse client via Resend, avec réservation atomique par message.
 * Un nouveau message sur le même ticket peut être envoyé ; le même sendKey non.
 */
export async function sendCustomerResponse(
  input: SendCustomerResponseInput,
): Promise<SendCustomerResponseResult> {
  const body = input.responseBody.trim();
  if (!body) {
    return {
      ok: false,
      error: "La réponse ne peut pas être vide.",
      status: 400,
    };
  }
  if (body.length > 12000) {
    return {
      ok: false,
      error: "La réponse est trop longue.",
      status: 400,
    };
  }

  const ticket = await getTicketById(input.ticketId);
  if (!ticket) {
    return { ok: false, error: "Ticket introuvable.", status: 404 };
  }

  const recipient = ticket.email?.trim();
  if (!recipient) {
    return {
      ok: false,
      error: "Aucun email destinataire n'est associé à cette demande.",
      status: 400,
    };
  }

  if (input.mode === "automatic") {
    const settings = await getAppSettings();
    if (!isAutoSendCustomerResponseAllowed(ticket, settings)) {
      return {
        ok: false,
        error: "L'envoi automatique n'est pas autorisé pour cette demande.",
        status: 409,
        ticket,
      };
    }

    const already = await getSentOutboundByContent(input.ticketId, body);
    if (already) {
      return {
        ok: true,
        ticket,
        messageId: "",
        alreadySent: true,
      };
    }
  }

  const sendKey = stableSendKey(
    input.ticketId,
    input.mode,
    body,
    input.sendKey,
  );

  const claimed = await claimOutboundMessageSend({
    ticketId: input.ticketId,
    sendKey,
    content: body,
    senderType: input.mode === "manual" ? "human" : "ai",
    senderName:
      input.mode === "manual" ? "Responsable" : "Assistant IA",
  });

  if (!claimed.ok) {
    return {
      ok: false,
      error: "Envoi déjà en cours. Réessayez dans un instant.",
      status: 409,
      ticket,
    };
  }

  if (claimed.alreadySent) {
    const latest = (await getTicketById(input.ticketId)) ?? ticket;
    return {
      ok: true,
      ticket: latest,
      messageId: "",
      alreadySent: true,
    };
  }

  const emailResult = await sendCustomerResponseEmail({
    to: recipient,
    subject: `Re: ${ticket.subject}`,
    body,
    idempotencyKey: sendKey,
  });

  if (!emailResult.ok) {
    await revertOutboundMessageClaim(claimed.message.id);
    await createAutomationLog({
      ticketId: input.ticketId,
      action: "send_customer_response",
      status: "failed",
      target: ticket.name,
      recipient,
      executedBy: input.executedBy,
      error: emailResult.resendMessage
        ? `${emailResult.error}: ${emailResult.resendMessage}`
        : emailResult.error,
    });
    return {
      ok: false,
      error: userFacingEmailError(
        emailResult.error,
        emailResult.resendMessage,
      ),
      status: 502,
      ticket: (await getTicketById(input.ticketId)) ?? ticket,
    };
  }

  await markOutboundMessageSent(claimed.message.id, emailResult.messageId);

  await createAutomationLog({
    ticketId: input.ticketId,
    action: "send_customer_response",
    status: "success",
    target: ticket.name,
    recipient,
    messageId: emailResult.messageId,
    executedBy: input.executedBy,
  });

  // Métadonnées ticket : dernier envoi (informatif), pas un verrou global.
  const finalized =
    (await updateTicket(input.ticketId, {
      aiResponse: body,
      responseSent: true,
      responseSentAt: new Date().toISOString(),
      responseSentMode: input.mode,
      status: "resolved",
    })) ?? ticket;

  return {
    ok: true,
    ticket: finalized,
    messageId: emailResult.messageId,
  };
}
