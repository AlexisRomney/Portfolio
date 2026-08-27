export type MessageSenderType = "customer" | "ai" | "human" | "system";

export type MessageDirection = "inbound" | "outbound" | "internal";

/** Brouillon local/serveur vs message réellement expédié. */
export type MessageDeliveryStatus = "draft" | "sending" | "sent";

export type TicketMessage = {
  id: string;
  ticketId: string;
  senderType: MessageSenderType;
  senderName: string | null;
  senderEmail: string | null;
  content: string;
  direction: MessageDirection;
  deliveryStatus: MessageDeliveryStatus;
  sendKey: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type TicketMessageCreateInput = {
  ticketId: string;
  senderType: MessageSenderType;
  senderName?: string | null;
  senderEmail?: string | null;
  content: string;
  direction: MessageDirection;
  deliveryStatus?: MessageDeliveryStatus;
  sendKey?: string | null;
  sentAt?: string | null;
};
