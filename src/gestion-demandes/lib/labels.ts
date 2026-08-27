import type {
  TicketPriority,
  TicketStatus,
} from "@gd/types/ticket";

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  high: "Haute",
  medium: "Normale",
  low: "Faible",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  new: "À traiter",
  pending: "En attente",
  in_progress: "En cours",
  resolved: "Résolu",
};

/** Phase métier dérivée des champs existants (sans nouveau statut DB). */
export function ticketLifecycleLabel(ticket: {
  status: TicketStatus;
  escalation: boolean | null;
  assigneeId: string | null;
  assigneeName: string | null;
  aiResponse: string | null;
  responseSent: boolean | null;
}): string {
  if (ticket.responseSent) return "Réponse envoyée";
  if (ticket.status === "resolved") return "Résolu";
  if (ticket.escalation === true) return "Escaladé";
  if (ticket.aiResponse?.trim()) return "Réponse préparée";
  if (ticket.assigneeId || ticket.assigneeName) return "Assigné";
  if (ticket.status === "in_progress") return "En cours";
  if (ticket.status === "pending") return "En attente";
  return "À traiter";
}

export const SENTIMENT_LABELS = {
  positive: "Positif",
  neutral: "Neutre",
  negative: "Négatif",
} as const;

/** Fuseau fixe : évite un écart Node (souvent UTC) vs navigateur (Europe/Paris). */
const DATE_TZ = "Europe/Paris";

export function formatDate(iso: string, locale: "fr" | "en" = "fr"): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: DATE_TZ,
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, locale: "fr" | "en" = "fr"): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DATE_TZ,
  }).format(new Date(iso));
}
