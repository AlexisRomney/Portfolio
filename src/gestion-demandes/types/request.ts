/**
 * Compatibilité : le domaine principal est désormais Ticket (Neon).
 * Ce module réexporte les types utiles pour limiter les casse-têtes d'imports.
 */
export type {
  Ticket as Request,
  TicketCategory as Category,
  TicketPriority as Priority,
  TicketStatus as Status,
  TicketCreateInput as RequestCreateInput,
} from "@gd/types/ticket";

export {
  TICKET_CATEGORIES as CATEGORIES,
  TICKET_PRIORITIES as PRIORITIES,
  TICKET_STATUSES as STATUSES,
} from "@gd/types/ticket";
