import type { TicketMessage } from "@gd/types/ticketMessage";

const STORAGE_KEY = "assistant-ia.ticket-local-conversations.v1";

export type TicketLocalConversation = {
  messages: TicketMessage[];
  draft: string;
  proposal?: string;
  proposalCreatedAt?: string;
  /** Clé d'idempotence pour la proposition en cours. */
  proposalSendKey?: string;
};

type ConversationMap = Record<string, TicketLocalConversation>;

const EMPTY_CONVERSATION: TicketLocalConversation = {
  messages: [],
  draft: "",
};

function readAll(): ConversationMap {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "{}",
    ) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as ConversationMap)
      : {};
  } catch {
    return {};
  }
}

function normalizeMessage(message: TicketMessage): TicketMessage {
  return {
    ...message,
    deliveryStatus: message.deliveryStatus ?? "sent",
    sendKey: message.sendKey ?? null,
    sentAt: message.sentAt ?? null,
  };
}

export function readTicketLocalConversation(
  ticketId: string,
): TicketLocalConversation {
  const stored = readAll()[ticketId];
  if (!stored) return { ...EMPTY_CONVERSATION };
  return {
    messages: Array.isArray(stored.messages)
      ? stored.messages.map(normalizeMessage)
      : [],
    draft: typeof stored.draft === "string" ? stored.draft : "",
    ...(typeof stored.proposal === "string"
      ? { proposal: stored.proposal }
      : {}),
    ...(typeof stored.proposalCreatedAt === "string"
      ? { proposalCreatedAt: stored.proposalCreatedAt }
      : {}),
    ...(typeof stored.proposalSendKey === "string"
      ? { proposalSendKey: stored.proposalSendKey }
      : {}),
  };
}

export function patchTicketLocalConversation(
  ticketId: string,
  patch: Partial<TicketLocalConversation>,
): TicketLocalConversation {
  const map = readAll();
  const next = {
    ...EMPTY_CONVERSATION,
    ...(map[ticketId] ?? {}),
    ...patch,
  };
  if (Array.isArray(next.messages)) {
    next.messages = next.messages.map(normalizeMessage);
  }
  map[ticketId] = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  return next;
}
