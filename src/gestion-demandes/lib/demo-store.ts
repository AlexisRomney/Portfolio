import { DEMO_TICKETS } from "@gd/data/demo-tickets";
import { assignmentDepartmentKey } from "@gd/lib/departments";
import type { AppSettings } from "@gd/services/appSettingsService";
import type {
  AutomationLog,
  AutomationLogInput,
} from "@gd/services/automationLogService";
import type {
  TeamMemberCreateInput,
  TeamMemberUpdateInput,
} from "@gd/services/teamMemberService";
import type { ControlResultPatch } from "@gd/services/ticketService";
import type {
  Ticket,
  TicketCreateInput,
  TicketUpdateInput,
} from "@gd/types/ticket";
import type {
  TicketMessage,
  TicketMessageCreateInput,
} from "@gd/types/ticketMessage";
import type { TeamMember } from "@gd/types/teamMember";

const DEMO_TEAM_SEEDS: Omit<TeamMember, "createdAt" | "updatedAt">[] = [
  {
    id: "c1111111-1111-4111-8111-111111111111",
    name: "Sandrine",
    email: "delivered+sandrine@resend.dev",
    department: "Facturation",
    role: "Comptable",
    active: true,
  },
  {
    id: "c2222222-2222-4222-8222-222222222222",
    name: "Mathieu",
    email: "delivered+mathieu@resend.dev",
    department: "IT Support",
    role: "Technicien support",
    active: true,
  },
  {
    id: "c3333333-3333-4333-8333-333333333333",
    name: "Fabienne",
    email: "delivered+fabienne@resend.dev",
    department: "Ressources humaines",
    role: "Responsable RH",
    active: true,
  },
  {
    id: "c4444444-4444-4444-8444-444444444444",
    name: "Camille",
    email: "delivered+camille@resend.dev",
    department: "Commercial",
    role: "Chargée commerciale",
    active: true,
  },
  {
    id: "c5555555-5555-4555-8555-555555555555",
    name: "Thomas",
    email: "delivered+thomas@resend.dev",
    department: "IT Support",
    role: "Technicien support",
    active: true,
  },
  {
    id: "c6666666-6666-4666-8666-666666666666",
    name: "Julien",
    email: "delivered+julien@resend.dev",
    department: "IT Support",
    role: "Technicien support",
    active: true,
  },
  {
    id: "c7777777-7777-4777-8777-777777777777",
    name: "Laura",
    email: "delivered+laura@resend.dev",
    department: "Facturation",
    role: "Gestionnaire facturation",
    active: true,
  },
  {
    id: "c8888888-8888-4888-8888-888888888888",
    name: "Nicolas",
    email: "delivered+nicolas@resend.dev",
    department: "Facturation",
    role: "Gestionnaire facturation",
    active: true,
  },
  {
    id: "c9999999-9999-4999-8999-999999999999",
    name: "Claire",
    email: "delivered+claire@resend.dev",
    department: "Ressources humaines",
    role: "Chargée RH",
    active: true,
  },
  {
    id: "caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Sophie",
    email: "delivered+sophie@resend.dev",
    department: "Ressources humaines",
    role: "Chargée RH",
    active: true,
  },
  {
    id: "cbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "Antoine",
    email: "delivered+antoine@resend.dev",
    department: "Commercial",
    role: "Chargé commercial",
    active: true,
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    name: "Marc",
    email: "delivered+marc@resend.dev",
    department: "Commercial",
    role: "Chargé commercial",
    active: true,
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  controlScoreThreshold: 90,
  autoSendResponses: false,
};

const BUSINESS_OUTCOME_ACTIONS = new Set([
  "notify_assignee",
  "notify_department",
  "escalate_human",
  "manual_review",
  "send_customer_response",
]);

function cloneTicket(ticket: Ticket): Ticket {
  return structuredClone(ticket);
}

function nowIso(): string {
  return new Date().toISOString();
}

type DemoState = {
  tickets: Map<string, Ticket>;
  teamMembers: Map<string, TeamMember>;
  settings: AppSettings;
  messages: Map<string, TicketMessage[]>;
  automationLogs: AutomationLog[];
  assignmentCounters: Map<string, number>;
};

let state: DemoState | null = null;

function getState(): DemoState {
  ensureHydrated();
  return state!;
}

export function ensureHydrated(): void {
  if (state) return;

  const seededAt = nowIso();
  const tickets = new Map<string, Ticket>();
  for (const ticket of DEMO_TICKETS) {
    tickets.set(ticket.id, cloneTicket(ticket));
  }

  const teamMembers = new Map<string, TeamMember>();
  for (const seed of DEMO_TEAM_SEEDS) {
    teamMembers.set(seed.id, {
      ...seed,
      createdAt: seededAt,
      updatedAt: seededAt,
    });
  }

  state = {
    tickets,
    teamMembers,
    settings: { ...DEFAULT_SETTINGS },
    messages: new Map(),
    automationLogs: [],
    assignmentCounters: new Map(),
  };
}

function touchTicket(ticket: Ticket): Ticket {
  return { ...ticket, updatedAt: nowIso() };
}

export function createTicket(input: TicketCreateInput): Ticket {
  const s = getState();
  const createdAt = nowIso();
  const ticket: Ticket = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    category: input.category ?? null,
    subcategory: input.subcategory ?? null,
    priority: input.priority ?? null,
    sentiment: input.sentiment ?? null,
    summary: input.summary ?? null,
    action: input.action ?? null,
    usefulInformation: input.usefulInformation ?? null,
    department: input.department ?? null,
    assigneeType: input.assigneeType ?? null,
    assigneeId: input.assigneeId ?? null,
    assigneeName: input.assigneeName ?? null,
    routingReason: input.routingReason ?? null,
    recommendedAction: input.recommendedAction ?? null,
    escalation: input.escalation ?? null,
    escalationReason: input.escalationReason ?? null,
    status: input.status ?? "new",
    aiResponse: input.aiResponse ?? null,
    controlApproved: input.controlApproved ?? null,
    controlScore: input.controlScore ?? null,
    controlIssues: input.controlIssues ?? null,
    controlWarnings: input.controlWarnings ?? null,
    requiresHumanReview: input.requiresHumanReview ?? null,
    reviewReason: input.reviewReason ?? null,
    correctedPriority: input.correctedPriority ?? null,
    correctedDepartment: input.correctedDepartment ?? null,
    correctedAction: input.correctedAction ?? null,
    controlSummary: input.controlSummary ?? null,
    controlAttemptVersion: input.controlAttemptVersion ?? 0,
    controlCompletedVersion: input.controlCompletedVersion ?? null,
    processedBy: input.processedBy ?? null,
    processedAt: input.processedAt ?? null,
    automationStatus: input.automationStatus ?? null,
    responseSent: input.responseSent ?? null,
    responseSentAt: input.responseSentAt ?? null,
    responseSentMode: input.responseSentMode ?? null,
    createdAt,
    updatedAt: createdAt,
  };
  s.tickets.set(ticket.id, ticket);
  return cloneTicket(ticket);
}

export function getTickets(): Ticket[] {
  const s = getState();
  return Array.from(s.tickets.values())
    .map(cloneTicket)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTicketById(id: string): Ticket | null {
  const ticket = getState().tickets.get(id);
  return ticket ? cloneTicket(ticket) : null;
}

export function updateTicket(
  id: string,
  patch: TicketUpdateInput,
): Ticket | null {
  const s = getState();
  const current = s.tickets.get(id);
  if (!current) return null;

  const next: Ticket = touchTicket({
    ...current,
    name: patch.name ?? current.name,
    email: patch.email ?? current.email,
    subject: patch.subject ?? current.subject,
    message: patch.message ?? current.message,
    category: patch.category !== undefined ? patch.category : current.category,
    subcategory:
      patch.subcategory !== undefined ? patch.subcategory : current.subcategory,
    priority: patch.priority !== undefined ? patch.priority : current.priority,
    sentiment:
      patch.sentiment !== undefined ? patch.sentiment : current.sentiment,
    summary: patch.summary !== undefined ? patch.summary : current.summary,
    action: patch.action !== undefined ? patch.action : current.action,
    usefulInformation:
      patch.usefulInformation !== undefined
        ? patch.usefulInformation
        : current.usefulInformation,
    department:
      patch.department !== undefined ? patch.department : current.department,
    assigneeType:
      patch.assigneeType !== undefined
        ? patch.assigneeType
        : current.assigneeType,
    assigneeId:
      patch.assigneeId !== undefined ? patch.assigneeId : current.assigneeId,
    assigneeName:
      patch.assigneeName !== undefined
        ? patch.assigneeName
        : current.assigneeName,
    routingReason:
      patch.routingReason !== undefined
        ? patch.routingReason
        : current.routingReason,
    recommendedAction:
      patch.recommendedAction !== undefined
        ? patch.recommendedAction
        : current.recommendedAction,
    escalation:
      patch.escalation !== undefined ? patch.escalation : current.escalation,
    escalationReason:
      patch.escalationReason !== undefined
        ? patch.escalationReason
        : current.escalationReason,
    status: patch.status ?? current.status,
    aiResponse:
      patch.aiResponse !== undefined ? patch.aiResponse : current.aiResponse,
    controlApproved:
      patch.controlApproved !== undefined
        ? patch.controlApproved
        : current.controlApproved,
    controlScore:
      patch.controlScore !== undefined
        ? patch.controlScore
        : current.controlScore,
    controlIssues:
      patch.controlIssues !== undefined
        ? patch.controlIssues
        : current.controlIssues,
    controlWarnings:
      patch.controlWarnings !== undefined
        ? patch.controlWarnings
        : current.controlWarnings,
    requiresHumanReview:
      patch.requiresHumanReview !== undefined
        ? patch.requiresHumanReview
        : current.requiresHumanReview,
    reviewReason:
      patch.reviewReason !== undefined
        ? patch.reviewReason
        : current.reviewReason,
    correctedPriority:
      patch.correctedPriority !== undefined
        ? patch.correctedPriority
        : current.correctedPriority,
    correctedDepartment:
      patch.correctedDepartment !== undefined
        ? patch.correctedDepartment
        : current.correctedDepartment,
    correctedAction:
      patch.correctedAction !== undefined
        ? patch.correctedAction
        : current.correctedAction,
    controlSummary:
      patch.controlSummary !== undefined
        ? patch.controlSummary
        : current.controlSummary,
    controlAttemptVersion:
      patch.controlAttemptVersion !== undefined
        ? patch.controlAttemptVersion
        : current.controlAttemptVersion,
    controlCompletedVersion:
      patch.controlCompletedVersion !== undefined
        ? patch.controlCompletedVersion
        : current.controlCompletedVersion,
    processedBy:
      patch.processedBy !== undefined ? patch.processedBy : current.processedBy,
    processedAt:
      patch.processedAt !== undefined ? patch.processedAt : current.processedAt,
    automationStatus:
      patch.automationStatus !== undefined
        ? patch.automationStatus
        : current.automationStatus,
    responseSent:
      patch.responseSent !== undefined
        ? patch.responseSent
        : current.responseSent,
    responseSentAt:
      patch.responseSentAt !== undefined
        ? patch.responseSentAt
        : current.responseSentAt,
    responseSentMode:
      patch.responseSentMode !== undefined
        ? patch.responseSentMode
        : current.responseSentMode,
  });

  s.tickets.set(id, next);
  return cloneTicket(next);
}

export function beginTicketControlAttempt(id: string): Ticket | null {
  const s = getState();
  const current = s.tickets.get(id);
  if (!current) return null;

  const next = touchTicket({
    ...current,
    controlAttemptVersion: current.controlAttemptVersion + 1,
    controlCompletedVersion: null,
    controlApproved: null,
    controlScore: null,
    controlIssues: null,
    controlWarnings: null,
    requiresHumanReview: null,
    reviewReason: null,
    correctedPriority: null,
    correctedDepartment: null,
    correctedAction: null,
    controlSummary: null,
  });
  s.tickets.set(id, next);
  return cloneTicket(next);
}

export function completeTicketControlAttempt(
  id: string,
  attemptVersion: number,
  patch: ControlResultPatch,
): Ticket | null {
  const s = getState();
  const current = s.tickets.get(id);
  if (!current) return null;
  if (current.controlAttemptVersion !== attemptVersion) return null;

  const next = touchTicket({
    ...current,
    controlApproved: patch.controlApproved ?? null,
    controlScore: patch.controlScore ?? null,
    controlIssues: patch.controlIssues ?? null,
    controlWarnings: patch.controlWarnings ?? null,
    requiresHumanReview: patch.requiresHumanReview ?? null,
    reviewReason: patch.reviewReason ?? null,
    correctedPriority: patch.correctedPriority ?? null,
    correctedDepartment: patch.correctedDepartment ?? null,
    correctedAction: patch.correctedAction ?? null,
    controlSummary: patch.controlSummary ?? null,
    controlCompletedVersion: attemptVersion,
  });
  s.tickets.set(id, next);
  return cloneTicket(next);
}

export function claimTicketAutomation(id: string): Ticket | null {
  const s = getState();
  const current = s.tickets.get(id);
  if (!current) return null;

  const status = current.automationStatus ?? "";
  if (
    current.controlAttemptVersion <= 0 ||
    current.controlCompletedVersion !== current.controlAttemptVersion ||
    current.controlApproved !== true ||
    current.requiresHumanReview === true ||
    current.processedBy !== null ||
    status === "completed" ||
    status === "processing" ||
    current.status === "resolved"
  ) {
    return null;
  }

  const next = touchTicket({
    ...current,
    automationStatus: "processing",
  });
  s.tickets.set(id, next);
  return cloneTicket(next);
}

function messagesFor(ticketId: string): TicketMessage[] {
  const s = getState();
  let list = s.messages.get(ticketId);
  if (!list) {
    list = [];
    s.messages.set(ticketId, list);
  }
  return list;
}

export function createTicketMessage(
  input: TicketMessageCreateInput,
): TicketMessage {
  const content = input.content.trim();
  if (!content) throw new Error("EMPTY_MESSAGE");

  const deliveryStatus = input.deliveryStatus ?? "sent";
  const createdAt = nowIso();
  const message: TicketMessage = {
    id: crypto.randomUUID(),
    ticketId: input.ticketId,
    senderType: input.senderType,
    senderName: input.senderName ?? null,
    senderEmail: input.senderEmail ?? null,
    content,
    direction: input.direction,
    deliveryStatus,
    sendKey: input.sendKey ?? null,
    sentAt:
      deliveryStatus === "sent"
        ? (input.sentAt ?? createdAt)
        : null,
    createdAt,
  };

  const list = messagesFor(input.ticketId);
  list.push(message);
  return structuredClone(message);
}

export function listTicketMessages(ticketId: string): TicketMessage[] {
  return messagesFor(ticketId)
    .slice()
    .sort((a, b) => {
      const byCreated = a.createdAt.localeCompare(b.createdAt);
      if (byCreated !== 0) return byCreated;
      return a.id.localeCompare(b.id);
    })
    .map((m) => structuredClone(m));
}

export function getTicketMessageBySendKey(
  sendKey: string,
): TicketMessage | null {
  for (const list of getState().messages.values()) {
    const found = list.find((m) => m.sendKey === sendKey);
    if (found) return structuredClone(found);
  }
  return null;
}

export function getSentOutboundByContent(
  ticketId: string,
  content: string,
): TicketMessage | null {
  const trimmed = content.trim();
  const matches = messagesFor(ticketId)
    .filter(
      (m) =>
        m.direction === "outbound" &&
        m.deliveryStatus === "sent" &&
        m.content === trimmed,
    )
    .sort((a, b) => {
      const byCreated = b.createdAt.localeCompare(a.createdAt);
      if (byCreated !== 0) return byCreated;
      return b.id.localeCompare(a.id);
    });
  return matches[0] ? structuredClone(matches[0]) : null;
}

export function getDraftOutboundByContent(
  ticketId: string,
  content: string,
): TicketMessage | null {
  const trimmed = content.trim();
  const matches = messagesFor(ticketId)
    .filter(
      (m) =>
        m.direction === "outbound" &&
        m.deliveryStatus === "draft" &&
        m.content === trimmed,
    )
    .sort((a, b) => {
      const byCreated = b.createdAt.localeCompare(a.createdAt);
      if (byCreated !== 0) return byCreated;
      return b.id.localeCompare(a.id);
    });
  return matches[0] ? structuredClone(matches[0]) : null;
}

function updateMessageInPlace(
  messageId: string,
  updater: (msg: TicketMessage) => TicketMessage | null,
): TicketMessage | null {
  for (const list of getState().messages.values()) {
    const idx = list.findIndex((m) => m.id === messageId);
    if (idx === -1) continue;
    const updated = updater(list[idx]);
    if (updated === null) {
      return structuredClone(list[idx]);
    }
    list[idx] = updated;
    return structuredClone(updated);
  }
  return null;
}

export function claimOutboundMessageSend(input: {
  ticketId: string;
  sendKey: string;
  content: string;
  senderType: "ai" | "human";
  senderName: string;
}):
  | { ok: true; message: TicketMessage; alreadySent: boolean }
  | { ok: false; reason: "conflict" } {
  const content = input.content.trim();
  const sendKey = input.sendKey.trim();

  const existing = getTicketMessageBySendKey(sendKey);
  if (existing) {
    if (existing.deliveryStatus === "sent") {
      return { ok: true, message: existing, alreadySent: true };
    }

    if (existing.deliveryStatus === "draft") {
      const claimed = updateMessageInPlace(existing.id, (msg) => {
        if (msg.deliveryStatus !== "draft") return null;
        return {
          ...msg,
          content,
          senderType: input.senderType,
          senderName: input.senderName,
          deliveryStatus: "sending",
        };
      });
      if (claimed?.deliveryStatus === "sending") {
        return { ok: true, message: claimed, alreadySent: false };
      }
    }

    const latest = getTicketMessageBySendKey(sendKey);
    if (latest?.deliveryStatus === "sent") {
      return { ok: true, message: latest, alreadySent: true };
    }
    return { ok: false, reason: "conflict" };
  }

  const draft = getDraftOutboundByContent(input.ticketId, content);
  if (draft) {
    const claimedDraft = updateMessageInPlace(draft.id, (msg) => {
      if (msg.deliveryStatus !== "draft" || msg.sendKey !== null) return null;
      return {
        ...msg,
        sendKey,
        senderType: input.senderType,
        senderName: input.senderName,
        deliveryStatus: "sending",
      };
    });
    if (claimedDraft?.deliveryStatus === "sending") {
      return { ok: true, message: claimedDraft, alreadySent: false };
    }
  }

  if (getTicketMessageBySendKey(sendKey)) {
    const raced = getTicketMessageBySendKey(sendKey);
    if (raced?.deliveryStatus === "sent") {
      return { ok: true, message: raced, alreadySent: true };
    }
    return { ok: false, reason: "conflict" };
  }

  const inserted = createTicketMessage({
    ticketId: input.ticketId,
    senderType: input.senderType,
    senderName: input.senderName,
    senderEmail: null,
    content,
    direction: "outbound",
    deliveryStatus: "sending",
    sendKey,
  });
  return { ok: true, message: inserted, alreadySent: false };
}

export function markOutboundMessageSent(
  messageId: string,
  _resendMessageId?: string | null,
): TicketMessage | null {
  void _resendMessageId;
  const updated = updateMessageInPlace(messageId, (msg) => {
    if (msg.deliveryStatus !== "sending" && msg.deliveryStatus !== "draft") {
      return null;
    }
    return {
      ...msg,
      deliveryStatus: "sent",
      sentAt: nowIso(),
    };
  });
  if (updated) return updated;

  for (const list of getState().messages.values()) {
    const found = list.find((m) => m.id === messageId);
    if (found) return structuredClone(found);
  }
  return null;
}

export function revertOutboundMessageClaim(messageId: string): void {
  updateMessageInPlace(messageId, (msg) => {
    if (msg.deliveryStatus !== "sending") return null;
    return {
      ...msg,
      deliveryStatus: "draft",
      sentAt: null,
    };
  });
}

export function replaceTicketResponseDraft(input: {
  ticketId: string;
  previousContent: string | null;
  content: string;
  senderType: "ai" | "human";
  senderName: string;
  sendKey?: string | null;
}): TicketMessage {
  const previousContent = input.previousContent?.trim() ?? "";
  if (previousContent) {
    const list = messagesFor(input.ticketId);
    const candidates = list
      .filter(
        (m) =>
          m.direction === "outbound" &&
          (m.senderType === "ai" || m.senderType === "human") &&
          (m.deliveryStatus === "draft" || m.deliveryStatus === "sending") &&
          m.content === previousContent,
      )
      .sort((a, b) => {
        const byCreated = b.createdAt.localeCompare(a.createdAt);
        if (byCreated !== 0) return byCreated;
        return b.id.localeCompare(a.id);
      });
    const toDelete = candidates[0];
    if (toDelete) {
      const idx = list.findIndex((m) => m.id === toDelete.id);
      if (idx !== -1) list.splice(idx, 1);
    }
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

export function listActiveTeamMembers(): TeamMember[] {
  return Array.from(getState().teamMembers.values())
    .filter((m) => m.active)
    .sort((a, b) => {
      const byDept = a.department.localeCompare(b.department);
      if (byDept !== 0) return byDept;
      return a.name.localeCompare(b.name);
    })
    .map((m) => structuredClone(m));
}

export function listAllTeamMembers(): TeamMember[] {
  return Array.from(getState().teamMembers.values())
    .sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      const byDept = a.department.localeCompare(b.department);
      if (byDept !== 0) return byDept;
      return a.name.localeCompare(b.name);
    })
    .map((m) => structuredClone(m));
}

export function getTeamMemberById(id: string): TeamMember | null {
  const member = getState().teamMembers.get(id);
  return member ? structuredClone(member) : null;
}

export function createTeamMember(input: TeamMemberCreateInput): TeamMember {
  const createdAt = nowIso();
  const member: TeamMember = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    department: input.department.trim(),
    role: (input.role ?? "").trim() || "Collaborateur",
    active: input.active ?? true,
    createdAt,
    updatedAt: createdAt,
  };
  getState().teamMembers.set(member.id, member);
  return structuredClone(member);
}

export function updateTeamMember(
  id: string,
  patch: TeamMemberUpdateInput,
): TeamMember | null {
  const s = getState();
  const current = s.teamMembers.get(id);
  if (!current) return null;

  const next: TeamMember = {
    ...current,
    name: patch.name?.trim() ?? current.name,
    email: patch.email?.trim().toLowerCase() ?? current.email,
    department: patch.department?.trim() ?? current.department,
    role: patch.role?.trim() ?? current.role,
    active: patch.active ?? current.active,
    updatedAt: nowIso(),
  };
  s.teamMembers.set(id, next);
  return structuredClone(next);
}

export function assignNextActiveTeamMember(
  department: string,
): TeamMember | null {
  const s = getState();
  const stateKey = assignmentDepartmentKey(department);
  const pool = Array.from(s.teamMembers.values())
    .filter((m) => m.active && m.department === stateKey)
    .sort((a, b) => {
      const byCreated = a.createdAt.localeCompare(b.createdAt);
      if (byCreated !== 0) return byCreated;
      return a.id.localeCompare(b.id);
    });

  if (pool.length === 0) return null;

  const index = s.assignmentCounters.get(stateKey) ?? 0;
  s.assignmentCounters.set(stateKey, index + 1);
  const member = pool[index % pool.length];
  return structuredClone(member);
}

export function getAppSettings(): AppSettings {
  return { ...getState().settings };
}

export function updateAppSettings(patch: Partial<AppSettings>): AppSettings {
  const s = getState();
  s.settings = {
    controlScoreThreshold:
      patch.controlScoreThreshold !== undefined
        ? Math.min(100, Math.max(0, Math.round(patch.controlScoreThreshold)))
        : s.settings.controlScoreThreshold,
    autoSendResponses:
      patch.autoSendResponses !== undefined
        ? patch.autoSendResponses
        : s.settings.autoSendResponses,
  };
  return { ...s.settings };
}

export function createAutomationLog(input: AutomationLogInput): AutomationLog {
  const log: AutomationLog = {
    id: crypto.randomUUID(),
    ticketId: input.ticketId,
    action: input.action,
    status: input.status,
    target: input.target ?? null,
    recipient: input.recipient ?? null,
    messageId: input.messageId ?? null,
    executedBy: input.executedBy ?? "trigger.dev",
    error: input.error ?? null,
    executedAt: nowIso(),
  };
  getState().automationLogs.push(log);
  return structuredClone(log);
}

function listRecentOutcomeLogs(ticketId: string): AutomationLog[] {
  return getState()
    .automationLogs.filter(
      (log) =>
        log.ticketId === ticketId && BUSINESS_OUTCOME_ACTIONS.has(log.action),
    )
    .sort((a, b) => b.executedAt.localeCompare(a.executedAt))
    .slice(0, 10)
    .map((log) => structuredClone(log));
}

export function listRecentAutomationLogs(ticketId: string): AutomationLog[] {
  return listRecentOutcomeLogs(ticketId);
}

export function getAutomationOutcomeLogs(ticketId: string): AutomationLog[] {
  return getState()
    .automationLogs.filter(
      (log) =>
        log.ticketId === ticketId && BUSINESS_OUTCOME_ACTIONS.has(log.action),
    )
    .sort((a, b) => a.executedAt.localeCompare(b.executedAt))
    .map((log) => structuredClone(log));
}

/** Exported alias matching service naming for isolation patches. */
export const demoStore = {
  ensureHydrated,
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  beginTicketControlAttempt,
  completeTicketControlAttempt,
  claimTicketAutomation,
  createTicketMessage,
  listTicketMessages,
  getTicketMessageBySendKey,
  getSentOutboundByContent,
  getDraftOutboundByContent,
  claimOutboundMessageSend,
  markOutboundMessageSent,
  revertOutboundMessageClaim,
  replaceTicketResponseDraft,
  listActiveTeamMembers,
  listAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  assignNextActiveTeamMember,
  getAppSettings,
  updateAppSettings,
  createAutomationLog,
  listRecentAutomationLogs,
  getAutomationOutcomeLogs,
};
