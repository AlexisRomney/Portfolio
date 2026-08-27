import type {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@gd/types/ticket";

const STORAGE_KEY = "assistant-ia.ticket-local-overrides.v1";

export type TicketLocalOverride = {
  status?: TicketStatus;
  category?: TicketCategory | null;
  priority?: TicketPriority | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  department?: string | null;
  /** Affichage : le routage IA ne reflète plus l'état local courant. */
  routingOutdated?: boolean;
  /** Affichage : le contrôle IA porte sur d'autres données que l'état local. */
  controlOutdated?: boolean;
};

export type TicketLocalOverridesMap = Record<string, TicketLocalOverride>;

const OUTDATING_FIELDS: Array<keyof TicketLocalOverride> = [
  "status",
  "category",
  "priority",
  "assigneeId",
  "assigneeName",
  "department",
];

export function readTicketLocalOverrides(): TicketLocalOverridesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as TicketLocalOverridesMap;
  } catch {
    return {};
  }
}

export function writeTicketLocalOverrides(map: TicketLocalOverridesMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getTicketLocalOverride(
  ticketId: string,
): TicketLocalOverride | null {
  const map = readTicketLocalOverrides();
  return map[ticketId] ?? null;
}

export function setTicketLocalOverride(
  ticketId: string,
  patch: TicketLocalOverride,
): TicketLocalOverride {
  const map = readTicketLocalOverrides();
  const marksOutdated = OUTDATING_FIELDS.some((field) =>
    Object.prototype.hasOwnProperty.call(patch, field),
  );
  const next = {
    ...(map[ticketId] ?? {}),
    ...patch,
    ...(marksOutdated
      ? { routingOutdated: true, controlOutdated: true }
      : {}),
  };
  map[ticketId] = next;
  writeTicketLocalOverrides(map);
  return next;
}

/** Retire un champ d'override local (ex. status après résolution serveur). */
export function clearTicketLocalOverrideField(
  ticketId: string,
  field: keyof TicketLocalOverride,
): void {
  const map = readTicketLocalOverrides();
  const current = map[ticketId];
  if (!current || !Object.prototype.hasOwnProperty.call(current, field)) {
    return;
  }
  const next = { ...current };
  delete next[field];
  if (Object.keys(next).length === 0) {
    delete map[ticketId];
  } else {
    map[ticketId] = next;
  }
  writeTicketLocalOverrides(map);
}

/** Applique les overrides locaux sur un ticket serveur (sans mutation Neon). */
export function applyTicketLocalOverride(
  ticket: Ticket,
  override: TicketLocalOverride | null | undefined,
): Ticket {
  if (!override) return ticket;
  return {
    ...ticket,
    status: override.status ?? ticket.status,
    category:
      override.category !== undefined ? override.category : ticket.category,
    priority:
      override.priority !== undefined ? override.priority : ticket.priority,
    assigneeId:
      override.assigneeId !== undefined
        ? override.assigneeId
        : ticket.assigneeId,
    assigneeName:
      override.assigneeName !== undefined
        ? override.assigneeName
        : ticket.assigneeName,
    department:
      override.department !== undefined
        ? (override.department as Ticket["department"])
        : ticket.department,
  };
}

export function applyOverridesToTickets(tickets: Ticket[]): Ticket[] {
  const map = readTicketLocalOverrides();
  return tickets.map((ticket) =>
    applyTicketLocalOverride(ticket, map[ticket.id]),
  );
}

export function isFieldLocallyOverridden(
  ticketId: string,
  field: keyof TicketLocalOverride,
): boolean {
  const override = getTicketLocalOverride(ticketId);
  if (!override) return false;
  return Object.prototype.hasOwnProperty.call(override, field);
}

export function isLocalRoutingOutdated(ticketId: string): boolean {
  return getTicketLocalOverride(ticketId)?.routingOutdated === true;
}

export function isLocalControlOutdated(ticketId: string): boolean {
  return getTicketLocalOverride(ticketId)?.controlOutdated === true;
}
