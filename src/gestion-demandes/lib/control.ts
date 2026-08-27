import { DEPARTMENTS, type Department } from "@gd/types/routing";
import { TICKET_PRIORITIES, type TicketPriority } from "@gd/types/ticket";
import type { ControlDecision } from "@gd/types/control";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPriority(value: unknown): value is TicketPriority {
  return (
    typeof value === "string" && (TICKET_PRIORITIES as string[]).includes(value)
  );
}

function isDepartment(value: unknown): value is Department {
  return typeof value === "string" && (DEPARTMENTS as string[]).includes(value);
}

function parseStringList(value: unknown, errorCode: string): string[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(errorCode);
  }

  return value.map((item) => {
    if (!isNonEmptyString(item)) {
      throw new Error(errorCode);
    }
    return item.trim();
  });
}

function parseNullablePriority(value: unknown): TicketPriority | null {
  if (value === null || value === undefined || value === "") return null;
  if (!isPriority(value)) {
    throw new Error("INVALID_CONTROL_CORRECTED_PRIORITY");
  }
  return value;
}

function parseNullableDepartment(value: unknown): Department | null {
  if (value === null || value === undefined || value === "") return null;
  if (!isDepartment(value)) {
    throw new Error("INVALID_CONTROL_CORRECTED_DEPARTMENT");
  }
  return value;
}

function parseNullableString(value: unknown, errorCode: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (!isNonEmptyString(value)) {
    throw new Error(errorCode);
  }
  return value.trim();
}

/** Valide le résultat du contrôle IA renvoyé par Gemini. */
export function parseControlDecision(payload: unknown): ControlDecision {
  if (!payload || typeof payload !== "object") {
    throw new Error("INVALID_CONTROL_DECISION");
  }

  const data = payload as Record<string, unknown>;

  if (typeof data.approved !== "boolean") {
    throw new Error("INVALID_CONTROL_APPROVED");
  }

  if (typeof data.score !== "number" || Number.isNaN(data.score)) {
    throw new Error("INVALID_CONTROL_SCORE");
  }

  const score = Math.min(1, Math.max(0, data.score));

  const issues = parseStringList(data.issues, "INVALID_CONTROL_ISSUES");
  const warnings = parseStringList(data.warnings, "INVALID_CONTROL_WARNINGS");

  if (typeof data.requires_human_review !== "boolean") {
    throw new Error("INVALID_CONTROL_HUMAN_REVIEW");
  }

  let reviewReason: string | null = null;
  if (data.requires_human_review) {
    if (!isNonEmptyString(data.review_reason)) {
      throw new Error("INVALID_CONTROL_REVIEW_REASON");
    }
    reviewReason = data.review_reason.trim();
  } else {
    reviewReason = parseNullableString(
      data.review_reason,
      "INVALID_CONTROL_REVIEW_REASON",
    );
  }

  if (!isNonEmptyString(data.control_summary)) {
    throw new Error("INVALID_CONTROL_SUMMARY");
  }

  return {
    approved: data.approved,
    score,
    issues,
    warnings,
    requiresHumanReview: data.requires_human_review,
    reviewReason,
    correctedPriority: parseNullablePriority(data.corrected_priority),
    correctedDepartment: parseNullableDepartment(data.corrected_department),
    correctedAction: parseNullableString(
      data.corrected_action,
      "INVALID_CONTROL_CORRECTED_ACTION",
    ),
    controlSummary: data.control_summary.trim(),
  };
}
