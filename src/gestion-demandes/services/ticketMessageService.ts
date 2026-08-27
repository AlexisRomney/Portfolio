import { getDb } from "@gd/lib/db/client";
import { ensureTicketsSchema } from "@gd/lib/db/schema";
import type { Ticket } from "@gd/types/ticket";
import type {
  MessageDeliveryStatus,
  MessageDirection,
  MessageSenderType,
  TicketMessage,
  TicketMessageCreateInput,
} from "@gd/types/ticketMessage";

type MessageRow = {
  id: string;
  ticket_id: string;
  sender_type: string;
  sender_name: string | null;
  sender_email: string | null;
  content: string;
  direction: string;
  delivery_status: string | null;
  send_key: string | null;
  sent_at: string | Date | null;
  created_at: string | Date;
};

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapDeliveryStatus(value: string | null): MessageDeliveryStatus {
  if (value === "draft" || value === "sending" || value === "sent") {
    return value;
  }
  return "sent";
}

function mapRow(row: MessageRow): TicketMessage {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    senderType: row.sender_type as MessageSenderType,
    senderName: row.sender_name,
    senderEmail: row.sender_email,
    content: row.content,
    direction: row.direction as MessageDirection,
    deliveryStatus: mapDeliveryStatus(row.delivery_status),
    sendKey: row.send_key,
    sentAt: row.sent_at ? toIso(row.sent_at) : null,
    createdAt: toIso(row.created_at),
  };
}

export async function createTicketMessage(
  input: TicketMessageCreateInput,
): Promise<TicketMessage> {
  await ensureTicketsSchema();
  const sql = getDb();
  const content = input.content.trim();
  if (!content) {
    throw new Error("EMPTY_MESSAGE");
  }

  const deliveryStatus = input.deliveryStatus ?? "sent";
  const sentAt =
    deliveryStatus === "sent"
      ? (input.sentAt ?? new Date().toISOString())
      : null;

  const rows = await sql`
    INSERT INTO ticket_messages (
      ticket_id,
      sender_type,
      sender_name,
      sender_email,
      content,
      direction,
      delivery_status,
      send_key,
      sent_at
    ) VALUES (
      ${input.ticketId}::uuid,
      ${input.senderType},
      ${input.senderName ?? null},
      ${input.senderEmail ?? null},
      ${content},
      ${input.direction},
      ${deliveryStatus},
      ${input.sendKey ?? null},
      ${sentAt}
    )
    RETURNING *
  `;

  return mapRow(rows[0] as MessageRow);
}

export async function listTicketMessages(
  ticketId: string,
): Promise<TicketMessage[]> {
  await ensureTicketsSchema();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM ticket_messages
    WHERE ticket_id = ${ticketId}::uuid
    ORDER BY created_at ASC, id ASC
  `;
  return (rows as MessageRow[]).map(mapRow);
}

export async function getTicketMessageBySendKey(
  sendKey: string,
): Promise<TicketMessage | null> {
  await ensureTicketsSchema();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM ticket_messages
    WHERE send_key = ${sendKey}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return mapRow(rows[0] as MessageRow);
}

export async function getSentOutboundByContent(
  ticketId: string,
  content: string,
): Promise<TicketMessage | null> {
  await ensureTicketsSchema();
  const sql = getDb();
  const trimmed = content.trim();
  const rows = await sql`
    SELECT * FROM ticket_messages
    WHERE ticket_id = ${ticketId}::uuid
      AND direction = 'outbound'
      AND delivery_status = 'sent'
      AND content = ${trimmed}
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return mapRow(rows[0] as MessageRow);
}

export async function getDraftOutboundByContent(
  ticketId: string,
  content: string,
): Promise<TicketMessage | null> {
  await ensureTicketsSchema();
  const sql = getDb();
  const trimmed = content.trim();
  const rows = await sql`
    SELECT * FROM ticket_messages
    WHERE ticket_id = ${ticketId}::uuid
      AND direction = 'outbound'
      AND delivery_status = 'draft'
      AND content = ${trimmed}
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return mapRow(rows[0] as MessageRow);
}

/**
 * Réserve atomiquement l'envoi d'un message sortant via send_key.
 * Distingue « ce message précis » de « une réponse a déjà été envoyée ».
 */
export async function claimOutboundMessageSend(input: {
  ticketId: string;
  sendKey: string;
  content: string;
  senderType: "ai" | "human";
  senderName: string;
}): Promise<
  | { ok: true; message: TicketMessage; alreadySent: boolean }
  | { ok: false; reason: "conflict" }
> {
  await ensureTicketsSchema();
  const sql = getDb();
  const content = input.content.trim();
  const sendKey = input.sendKey.trim();

  const existing = await getTicketMessageBySendKey(sendKey);
  if (existing) {
    if (existing.deliveryStatus === "sent") {
      return { ok: true, message: existing, alreadySent: true };
    }

    if (existing.deliveryStatus === "draft") {
      const claimed = await sql`
        UPDATE ticket_messages SET
          content = ${content},
          sender_type = ${input.senderType},
          sender_name = ${input.senderName},
          delivery_status = 'sending'
        WHERE id = ${existing.id}::uuid
          AND delivery_status = 'draft'
        RETURNING *
      `;
      if (claimed[0]) {
        return {
          ok: true,
          message: mapRow(claimed[0] as MessageRow),
          alreadySent: false,
        };
      }
    }

    const latest = await getTicketMessageBySendKey(sendKey);
    if (latest?.deliveryStatus === "sent") {
      return { ok: true, message: latest, alreadySent: true };
    }
    return { ok: false, reason: "conflict" };
  }

  // Réutilise un brouillon serveur existant (même contenu) pour éviter un doublon.
  const draft = await getDraftOutboundByContent(input.ticketId, content);
  if (draft) {
    const claimedDraft = await sql`
      UPDATE ticket_messages SET
        send_key = ${sendKey},
        sender_type = ${input.senderType},
        sender_name = ${input.senderName},
        delivery_status = 'sending'
      WHERE id = ${draft.id}::uuid
        AND delivery_status = 'draft'
        AND send_key IS NULL
      RETURNING *
    `;
    if (claimedDraft[0]) {
      return {
        ok: true,
        message: mapRow(claimedDraft[0] as MessageRow),
        alreadySent: false,
      };
    }
  }

  try {
    const inserted = await sql`
      INSERT INTO ticket_messages (
        ticket_id,
        sender_type,
        sender_name,
        sender_email,
        content,
        direction,
        delivery_status,
        send_key
      ) VALUES (
        ${input.ticketId}::uuid,
        ${input.senderType},
        ${input.senderName},
        null,
        ${content},
        'outbound',
        'sending',
        ${sendKey}
      )
      RETURNING *
    `;
    return {
      ok: true,
      message: mapRow(inserted[0] as MessageRow),
      alreadySent: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/unique|duplicate/i.test(message)) {
      throw error;
    }
    const raced = await getTicketMessageBySendKey(sendKey);
    if (raced?.deliveryStatus === "sent") {
      return { ok: true, message: raced, alreadySent: true };
    }
    return { ok: false, reason: "conflict" };
  }
}

export async function markOutboundMessageSent(
  messageId: string,
  resendMessageId?: string | null,
): Promise<TicketMessage | null> {
  await ensureTicketsSchema();
  const sql = getDb();
  const rows = await sql`
    UPDATE ticket_messages SET
      delivery_status = 'sent',
      sent_at = NOW()
    WHERE id = ${messageId}::uuid
      AND delivery_status IN ('sending', 'draft')
    RETURNING *
  `;
  if (!rows[0]) {
    const current = await sql`
      SELECT * FROM ticket_messages WHERE id = ${messageId}::uuid LIMIT 1
    `;
    if (!current[0]) return null;
    return mapRow(current[0] as MessageRow);
  }
  void resendMessageId;
  return mapRow(rows[0] as MessageRow);
}

export async function revertOutboundMessageClaim(
  messageId: string,
): Promise<void> {
  await ensureTicketsSchema();
  const sql = getDb();
  await sql`
    UPDATE ticket_messages SET
      delivery_status = 'draft',
      sent_at = NULL
    WHERE id = ${messageId}::uuid
      AND delivery_status = 'sending'
  `;
}

/**
 * Remplace uniquement la proposition sortante non envoyée correspondant au
 * texte précédent. Les réponses déjà envoyées restent dans l'historique.
 */
export async function replaceTicketResponseDraft(input: {
  ticketId: string;
  previousContent: string | null;
  content: string;
  senderType: "ai" | "human";
  senderName: string;
  sendKey?: string | null;
}): Promise<TicketMessage> {
  await ensureTicketsSchema();
  const sql = getDb();
  const previousContent = input.previousContent?.trim() ?? "";

  if (previousContent) {
    await sql`
      DELETE FROM ticket_messages
      WHERE id = (
        SELECT id
        FROM ticket_messages
        WHERE ticket_id = ${input.ticketId}::uuid
          AND direction = 'outbound'
          AND sender_type IN ('ai', 'human')
          AND delivery_status IN ('draft', 'sending')
          AND content = ${previousContent}
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      )
    `;
  }

  return createTicketMessage({
    ticketId: input.ticketId,
    senderType: input.senderType,
    senderName: input.senderName,
    senderEmail: null,
    content: input.content,
    direction: "outbound",
    deliveryStatus: "draft",
    sendKey: input.sendKey ?? null,
  });
}

/**
 * Si aucun message n'existe encore, initialise la conversation
 * à partir du message initial et de la réponse IA éventuelle.
 */
export async function ensureTicketConversation(
  ticket: Ticket,
): Promise<TicketMessage[]> {
  const existing = await listTicketMessages(ticket.id);
  if (existing.length > 0) return existing;

  await createTicketMessage({
    ticketId: ticket.id,
    senderType: "customer",
    senderName: ticket.name,
    senderEmail: ticket.email,
    content: ticket.message,
    direction: "inbound",
    deliveryStatus: "sent",
  });

  if (ticket.aiResponse?.trim()) {
    const alreadySent = ticket.responseSent === true;
    await createTicketMessage({
      ticketId: ticket.id,
      senderType: "ai",
      senderName: "Assistant IA",
      senderEmail: null,
      content: ticket.aiResponse.trim(),
      direction: "outbound",
      deliveryStatus: alreadySent ? "sent" : "draft",
      sentAt: alreadySent ? ticket.responseSentAt : null,
    });
  }

  return listTicketMessages(ticket.id);
}

export function formatConversationForAi(
  messages: TicketMessage[],
  limit = 20,
): string {
  const slice = messages
    .filter((message) => message.deliveryStatus === "sent")
    .slice(-limit);
  return slice
    .map((m) => {
      const who =
        m.senderType === "customer"
          ? "Client"
          : m.senderType === "ai"
            ? "Assistant IA"
            : m.senderType === "human"
              ? "Agent"
              : "Système";
      return `[${who}] ${m.content}`;
    })
    .join("\n\n");
}
