import { getDb } from "@gd/lib/db/client";
import { ensureTicketsSchema } from "@gd/lib/db/schema";
import type {
  Ticket,
  TicketAssigneeType,
  TicketCategory,
  TicketCreateInput,
  TicketDepartment,
  TicketPriority,
  TicketSentiment,
  TicketStatus,
  TicketUpdateInput,
} from "@gd/types/ticket";

type TicketRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string | null;
  subcategory: string | null;
  priority: string | null;
  sentiment: string | null;
  summary: string | null;
  action: string | null;
  useful_information: unknown;
  department: string | null;
  assignee_type: string | null;
  assignee_id: string | null;
  assignee_name: string | null;
  routing_reason: string | null;
  recommended_action: string | null;
  escalation: boolean | null;
  escalation_reason: string | null;
  status: string;
  ai_response: string | null;
  control_approved: boolean | null;
  control_score: number | string | null;
  control_issues: unknown;
  control_warnings: unknown;
  requires_human_review: boolean | null;
  review_reason: string | null;
  corrected_priority: string | null;
  corrected_department: string | null;
  corrected_action: string | null;
  control_summary: string | null;
  control_attempt_version: number | string;
  control_completed_version: number | string | null;
  processed_by: string | null;
  processed_at: string | Date | null;
  automation_status: string | null;
  response_sent: boolean | null;
  response_sent_at: string | Date | null;
  response_sent_mode: string | null;
  is_demo?: boolean | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function parseStringArray(value: unknown): string[] | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    try {
      return parseStringArray(JSON.parse(value));
    } catch {
      return null;
    }
  }
  if (!Array.isArray(value)) return null;
  return value.filter((item): item is string => typeof item === "string");
}

function toScore(value: number | string | null): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function toInteger(value: number | string | null): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(num) ? num : null;
}

function mapRow(row: TicketRow): Ticket {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    category: (row.category as TicketCategory | null) ?? null,
    subcategory: row.subcategory,
    priority: (row.priority as TicketPriority | null) ?? null,
    sentiment: (row.sentiment as TicketSentiment | null) ?? null,
    summary: row.summary,
    action: row.action,
    usefulInformation: parseStringArray(row.useful_information),
    department: (row.department as TicketDepartment | null) ?? null,
    assigneeType: (row.assignee_type as TicketAssigneeType | null) ?? null,
    assigneeId: row.assignee_id,
    assigneeName: row.assignee_name,
    routingReason: row.routing_reason,
    recommendedAction: row.recommended_action,
    escalation: row.escalation,
    escalationReason: row.escalation_reason,
    status: row.status as TicketStatus,
    aiResponse: row.ai_response,
    controlApproved: row.control_approved,
    controlScore: toScore(row.control_score),
    controlIssues: parseStringArray(row.control_issues),
    controlWarnings: parseStringArray(row.control_warnings),
    requiresHumanReview: row.requires_human_review,
    reviewReason: row.review_reason,
    correctedPriority:
      (row.corrected_priority as TicketPriority | null) ?? null,
    correctedDepartment:
      (row.corrected_department as TicketDepartment | null) ?? null,
    correctedAction: row.corrected_action,
    controlSummary: row.control_summary,
    controlAttemptVersion: toInteger(row.control_attempt_version) ?? 0,
    controlCompletedVersion: toInteger(row.control_completed_version),
    processedBy: row.processed_by,
    processedAt: row.processed_at ? toIso(row.processed_at) : null,
    automationStatus: row.automation_status,
    responseSent: row.response_sent ?? null,
    responseSentAt: row.response_sent_at ? toIso(row.response_sent_at) : null,
    responseSentMode:
      row.response_sent_mode === "manual" || row.response_sent_mode === "automatic"
        ? row.response_sent_mode
        : null,
    isDemo: Boolean(row.is_demo),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

async function withSchema<T>(fn: () => Promise<T>): Promise<T> {
  await ensureTicketsSchema();
  return fn();
}

function jsonbValue(value: string[] | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

export async function createTicket(input: TicketCreateInput): Promise<Ticket> {
  return withSchema(async () => {
    const sql = getDb();
    const rows = await sql`
      INSERT INTO tickets (
        name,
        email,
        subject,
        message,
        category,
        subcategory,
        priority,
        sentiment,
        summary,
        action,
        useful_information,
        department,
        assignee_type,
        assignee_id,
        assignee_name,
        routing_reason,
        recommended_action,
        escalation,
        escalation_reason,
        status,
        ai_response,
        control_approved,
        control_score,
        control_issues,
        control_warnings,
        requires_human_review,
        review_reason,
        corrected_priority,
        corrected_department,
        corrected_action,
        control_summary,
        control_attempt_version,
        control_completed_version,
        is_demo
      ) VALUES (
        ${input.name.trim()},
        ${input.email.trim()},
        ${input.subject.trim()},
        ${input.message.trim()},
        ${input.category ?? null},
        ${input.subcategory ?? null},
        ${input.priority ?? null},
        ${input.sentiment ?? null},
        ${input.summary ?? null},
        ${input.action ?? null},
        ${jsonbValue(input.usefulInformation ?? null)}::jsonb,
        ${input.department ?? null},
        ${input.assigneeType ?? null},
        ${input.assigneeId ?? null},
        ${input.assigneeName ?? null},
        ${input.routingReason ?? null},
        ${input.recommendedAction ?? null},
        ${input.escalation ?? null},
        ${input.escalationReason ?? null},
        ${input.status ?? "new"},
        ${input.aiResponse ?? null},
        ${input.controlApproved ?? null},
        ${input.controlScore ?? null},
        ${jsonbValue(input.controlIssues)}::jsonb,
        ${jsonbValue(input.controlWarnings)}::jsonb,
        ${input.requiresHumanReview ?? null},
        ${input.reviewReason ?? null},
        ${input.correctedPriority ?? null},
        ${input.correctedDepartment ?? null},
        ${input.correctedAction ?? null},
        ${input.controlSummary ?? null},
        ${input.controlAttemptVersion ?? 0},
        ${input.controlCompletedVersion ?? null},
        ${input.isDemo ?? false}
      )
      RETURNING *
    `;

    return mapRow(rows[0] as TicketRow);
  });
}

export async function getTickets(): Promise<Ticket[]> {
  return withSchema(async () => {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM tickets
      ORDER BY created_at DESC
    `;
    return (rows as TicketRow[]).map(mapRow);
  });
}

/** Tickets de démonstration uniquement (filtre SQL serveur). */
export async function getDemoTickets(): Promise<Ticket[]> {
  return withSchema(async () => {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM tickets
      WHERE is_demo = true
      ORDER BY created_at DESC
    `;
    return (rows as TicketRow[]).map(mapRow);
  });
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  return withSchema(async () => {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM tickets
      WHERE id = ${id}::uuid
      LIMIT 1
    `;
    if (!rows[0]) return null;
    return mapRow(rows[0] as TicketRow);
  });
}

export async function updateTicket(
  id: string,
  patch: TicketUpdateInput,
): Promise<Ticket | null> {
  return withSchema(async () => {
    const current = await getTicketById(id);
    if (!current) return null;

    const next: Omit<Ticket, "id" | "createdAt" | "updatedAt"> = {
      name: patch.name ?? current.name,
      email: patch.email ?? current.email,
      subject: patch.subject ?? current.subject,
      message: patch.message ?? current.message,
      category:
        patch.category !== undefined ? patch.category : current.category,
      subcategory:
        patch.subcategory !== undefined
          ? patch.subcategory
          : current.subcategory,
      priority:
        patch.priority !== undefined ? patch.priority : current.priority,
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
        patch.processedBy !== undefined
          ? patch.processedBy
          : current.processedBy,
      processedAt:
        patch.processedAt !== undefined
          ? patch.processedAt
          : current.processedAt,
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
    };

    const sql = getDb();
    const rows = await sql`
      UPDATE tickets SET
        name = ${next.name},
        email = ${next.email},
        subject = ${next.subject},
        message = ${next.message},
        category = ${next.category},
        subcategory = ${next.subcategory},
        priority = ${next.priority},
        sentiment = ${next.sentiment},
        summary = ${next.summary},
        action = ${next.action},
        useful_information = ${jsonbValue(next.usefulInformation)}::jsonb,
        department = ${next.department},
        assignee_type = ${next.assigneeType},
        assignee_id = ${next.assigneeId},
        assignee_name = ${next.assigneeName},
        routing_reason = ${next.routingReason},
        recommended_action = ${next.recommendedAction},
        escalation = ${next.escalation},
        escalation_reason = ${next.escalationReason},
        status = ${next.status},
        ai_response = ${next.aiResponse},
        control_approved = ${next.controlApproved},
        control_score = ${next.controlScore},
        control_issues = ${jsonbValue(next.controlIssues)}::jsonb,
        control_warnings = ${jsonbValue(next.controlWarnings)}::jsonb,
        requires_human_review = ${next.requiresHumanReview},
        review_reason = ${next.reviewReason},
        corrected_priority = ${next.correctedPriority},
        corrected_department = ${next.correctedDepartment},
        corrected_action = ${next.correctedAction},
        control_summary = ${next.controlSummary},
        control_attempt_version = ${next.controlAttemptVersion},
        control_completed_version = ${next.controlCompletedVersion},
        processed_by = ${next.processedBy},
        processed_at = ${next.processedAt},
        automation_status = ${next.automationStatus},
        response_sent = ${next.responseSent},
        response_sent_at = ${next.responseSentAt},
        response_sent_mode = ${next.responseSentMode},
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

    if (!rows[0]) return null;
    return mapRow(rows[0] as TicketRow);
  });
}

export type ControlResultPatch = Pick<
  TicketUpdateInput,
  | "controlApproved"
  | "controlScore"
  | "controlIssues"
  | "controlWarnings"
  | "requiresHumanReview"
  | "reviewReason"
  | "correctedPriority"
  | "correctedDepartment"
  | "correctedAction"
  | "controlSummary"
>;

/**
 * Démarre atomiquement une nouvelle tentative de contrôle et rend tout
 * résultat antérieur immédiatement inutilisable.
 */
export async function beginTicketControlAttempt(
  id: string,
): Promise<Ticket | null> {
  return withSchema(async () => {
    const sql = getDb();
    const rows = await sql`
      UPDATE tickets SET
        control_attempt_version = control_attempt_version + 1,
        control_completed_version = NULL,
        control_approved = NULL,
        control_score = NULL,
        control_issues = NULL,
        control_warnings = NULL,
        requires_human_review = NULL,
        review_reason = NULL,
        corrected_priority = NULL,
        corrected_department = NULL,
        corrected_action = NULL,
        control_summary = NULL,
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;
    if (!rows[0]) return null;
    return mapRow(rows[0] as TicketRow);
  });
}

/**
 * Enregistre un contrôle seulement si sa tentative est toujours la plus
 * récente. Un résultat tardif ne peut donc jamais écraser le contrôle courant.
 */
export async function completeTicketControlAttempt(
  id: string,
  attemptVersion: number,
  patch: ControlResultPatch,
): Promise<Ticket | null> {
  return withSchema(async () => {
    const sql = getDb();
    const rows = await sql`
      UPDATE tickets SET
        control_approved = ${patch.controlApproved ?? null},
        control_score = ${patch.controlScore ?? null},
        control_issues = ${jsonbValue(patch.controlIssues)}::jsonb,
        control_warnings = ${jsonbValue(patch.controlWarnings)}::jsonb,
        requires_human_review = ${patch.requiresHumanReview ?? null},
        review_reason = ${patch.reviewReason ?? null},
        corrected_priority = ${patch.correctedPriority ?? null},
        corrected_department = ${patch.correctedDepartment ?? null},
        corrected_action = ${patch.correctedAction ?? null},
        control_summary = ${patch.controlSummary ?? null},
        control_completed_version = ${attemptVersion},
        updated_at = NOW()
      WHERE id = ${id}::uuid
        AND control_attempt_version = ${attemptVersion}
      RETURNING *
    `;
    if (!rows[0]) return null;
    return mapRow(rows[0] as TicketRow);
  });
}

/**
 * Réserve l'exécution métier uniquement avec le contrôle courant.
 */
export async function claimTicketAutomation(id: string): Promise<Ticket | null> {
  return withSchema(async () => {
    const sql = getDb();
    // Exclut aussi `processing` : deux runs simultanés ne peuvent pas
    // réserver le même ticket.
    const rows = await sql`
      UPDATE tickets SET
        automation_status = 'processing',
        updated_at = NOW()
      WHERE id = ${id}::uuid
        AND control_attempt_version > 0
        AND control_completed_version = control_attempt_version
        AND control_approved = true
        AND COALESCE(requires_human_review, false) = false
        AND processed_by IS NULL
        AND COALESCE(automation_status, '') NOT IN ('completed', 'processing')
        AND status <> 'resolved'
      RETURNING *
    `;
    if (!rows[0]) return null;
    return mapRow(rows[0] as TicketRow);
  });
}
