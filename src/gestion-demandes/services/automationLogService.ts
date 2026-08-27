import { getDb } from "@gd/lib/db/client";
import { ensureTicketsSchema } from "@gd/lib/db/schema";
import {
  isAutomationOutcomeLog,
  isBusinessActionLog,
} from "@gd/services/ticketActions";

export type AutomationLogInput = {
  ticketId: string | null;
  action: string;
  status: string;
  target?: string | null;
  recipient?: string | null;
  messageId?: string | null;
  executedBy?: string;
  error?: string | null;
};

export type AutomationLog = {
  id: string;
  ticketId: string | null;
  action: string;
  status: string;
  target: string | null;
  recipient: string | null;
  messageId: string | null;
  executedBy: string;
  error: string | null;
  executedAt: string;
};

function mapLog(row: {
  id: string;
  ticket_id: string | null;
  action: string;
  status: string;
  target: string | null;
  recipient: string | null;
  message_id: string | null;
  executed_by: string;
  error: string | null;
  executed_at: string | Date;
}): AutomationLog {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    action: row.action,
    status: row.status,
    target: row.target,
    recipient: row.recipient,
    messageId: row.message_id,
    executedBy: row.executed_by,
    error: row.error,
    executedAt:
      row.executed_at instanceof Date
        ? row.executed_at.toISOString()
        : new Date(row.executed_at).toISOString(),
  };
}

export async function createAutomationLog(
  input: AutomationLogInput,
): Promise<AutomationLog> {
  await ensureTicketsSchema();
  const sql = getDb();

  const rows = await sql`
    INSERT INTO automation_logs (
      ticket_id,
      action,
      status,
      target,
      recipient,
      message_id,
      executed_by,
      error
    ) VALUES (
      ${input.ticketId},
      ${input.action},
      ${input.status},
      ${input.target ?? null},
      ${input.recipient ?? null},
      ${input.messageId ?? null},
      ${input.executedBy ?? "trigger.dev"},
      ${input.error ?? null}
    )
    RETURNING
      id,
      ticket_id,
      action,
      status,
      target,
      recipient,
      message_id,
      executed_by,
      error,
      executed_at
  `;

  return mapLog(
    rows[0] as {
      id: string;
      ticket_id: string | null;
      action: string;
      status: string;
      target: string | null;
      recipient: string | null;
      message_id: string | null;
      executed_by: string;
      error: string | null;
      executed_at: string | Date;
    },
  );
}

type LogRow = {
  id: string;
  ticket_id: string | null;
  action: string;
  status: string;
  target: string | null;
  recipient: string | null;
  message_id: string | null;
  executed_by: string;
  error: string | null;
  executed_at: string | Date;
};

async function listRecentLogs(ticketId: string): Promise<LogRow[]> {
  await ensureTicketsSchema();
  const sql = getDb();

  const rows = await sql`
    SELECT
      id,
      ticket_id,
      action,
      status,
      target,
      recipient,
      message_id,
      executed_by,
      error,
      executed_at
    FROM automation_logs
    WHERE ticket_id = ${ticketId}::uuid
      AND action IN (
        'notify_assignee',
        'notify_department',
        'escalate_human',
        'manual_review',
        'send_customer_response'
      )
    ORDER BY executed_at DESC
    LIMIT 10
  `;

  return rows as LogRow[];
}

export async function getLatestBusinessAutomationLog(
  ticketId: string,
): Promise<AutomationLog | null> {
  for (const row of await listRecentLogs(ticketId)) {
    if (isBusinessActionLog(row.action, row.status)) {
      return mapLog(row);
    }
  }
  return null;
}

export async function getLatestAutomationOutcomeLog(
  ticketId: string,
): Promise<AutomationLog | null> {
  for (const row of await listRecentLogs(ticketId)) {
    if (isAutomationOutcomeLog(row.action)) {
      return mapLog(row);
    }
  }
  return null;
}

export async function getAutomationOutcomeLogs(
  ticketId: string,
): Promise<AutomationLog[]> {
  await ensureTicketsSchema();
  const sql = getDb();
  const rows = await sql`
    SELECT
      id,
      ticket_id,
      action,
      status,
      target,
      recipient,
      message_id,
      executed_by,
      error,
      executed_at
    FROM automation_logs
    WHERE ticket_id = ${ticketId}::uuid
      AND action IN (
        'notify_assignee',
        'notify_department',
        'escalate_human',
        'manual_review',
        'send_customer_response'
      )
    ORDER BY executed_at ASC
  `;

  return (rows as LogRow[]).map(mapLog);
}

export async function hasBusinessAutomationLog(
  ticketId: string,
): Promise<boolean> {
  const latest = await getLatestBusinessAutomationLog(ticketId);
  return latest !== null;
}
