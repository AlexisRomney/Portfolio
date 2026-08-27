import type {
  Ticket,
  TicketCategory,
  TicketDepartment,
  TicketPriority,
  TicketStatus,
} from "@gd/types/ticket";

export type TicketFilters = {
  search: string;
  category: TicketCategory | "all";
  priority: TicketPriority | "all";
  status: TicketStatus | "all";
  sort: "date_desc" | "date_asc";
};

export const DEFAULT_FILTERS: TicketFilters = {
  search: "",
  category: "all",
  priority: "all",
  status: "all",
  sort: "date_desc",
};

export function filterAndSortTickets(
  tickets: Ticket[],
  filters: TicketFilters,
): Ticket[] {
  const query = filters.search.trim().toLowerCase();

  const filtered = tickets.filter((ticket) => {
    const matchesSearch =
      query.length === 0 ||
      ticket.subject.toLowerCase().includes(query) ||
      ticket.name.toLowerCase().includes(query) ||
      ticket.email.toLowerCase().includes(query) ||
      ticket.message.toLowerCase().includes(query) ||
      (ticket.summary?.toLowerCase().includes(query) ?? false);

    const matchesCategory =
      filters.category === "all" || ticket.category === filters.category;

    const matchesPriority =
      filters.priority === "all" || ticket.priority === filters.priority;

    const matchesStatus =
      filters.status === "all" || ticket.status === filters.status;

    return (
      matchesSearch && matchesCategory && matchesPriority && matchesStatus
    );
  });

  return [...filtered].sort((a, b) => {
    const diff =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return filters.sort === "date_asc" ? diff : -diff;
  });
}

export function getTicketStats(tickets: Ticket[]) {
  const byCategory = tickets.reduce<Record<string, number>>((acc, ticket) => {
    const category = ticket.category ?? "Autre";
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});

  const byDepartment = tickets.reduce<Record<string, number>>((acc, ticket) => {
    if (!ticket.department) return acc;
    acc[ticket.department] = (acc[ticket.department] ?? 0) + 1;
    return acc;
  }, {});

  const byPriority = tickets.reduce<Record<TicketPriority, number>>(
    (acc, ticket) => {
      if (!ticket.priority) return acc;
      acc[ticket.priority] = (acc[ticket.priority] ?? 0) + 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 },
  );

  return {
    total: tickets.length,
    newCount: tickets.filter((t) => t.status === "new").length,
    awaiting: tickets.filter(
      (t) => t.status === "pending" || t.status === "new",
    ).length,
    urgent: tickets.filter((t) => t.priority === "high").length,
    escalated: tickets.filter((t) => t.escalation === true).length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    assigned: tickets.filter((t) => Boolean(t.assigneeId)).length,
    emailsSent: tickets.filter(
      (t) =>
        t.automationStatus === "completed" &&
        Boolean(t.processedBy) &&
        t.escalation !== true,
    ).length,
    controlChecked: tickets.filter((t) => typeof t.controlApproved === "boolean")
      .length,
    controlApproved: tickets.filter((t) => t.controlApproved === true).length,
    controlNeedsReview: tickets.filter(
      (t) =>
        t.requiresHumanReview === true ||
        t.controlApproved === false,
    ).length,
    controlAverageScore: (() => {
      const scores = tickets
        .map((t) => t.controlScore)
        .filter((s): s is number => typeof s === "number");
      if (scores.length === 0) return null;
      return scores.reduce((sum, s) => sum + s, 0) / scores.length;
    })(),
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    automationRatePercent: (() => {
      if (tickets.length === 0) return null;
      const automated = tickets.filter(
        (t) =>
          t.responseSentMode === "automatic" ||
          (t.automationStatus === "completed" && t.processedBy === "trigger.dev"),
      ).length;
      return Math.round((automated / tickets.length) * 100);
    })(),
    byCategory,
    byDepartment: byDepartment as Partial<Record<TicketDepartment, number>>,
    byPriority,
  };
}
