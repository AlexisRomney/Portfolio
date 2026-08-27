import {
  ASSIGNEE_TYPES,
  DEPARTMENTS,
  type AssigneeType,
  type Department,
  type RoutingDecision,
} from "@gd/types/routing";
import { assignmentDepartmentKey } from "@gd/lib/departments";
import {
  assignNextActiveTeamMember,
} from "@gd/services/teamMemberService";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isDepartment(value: unknown): value is Department {
  return typeof value === "string" && (DEPARTMENTS as string[]).includes(value);
}

function isAssigneeType(value: unknown): value is AssigneeType {
  return (
    typeof value === "string" && (ASSIGNEE_TYPES as string[]).includes(value)
  );
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value.trim(),
    )
  );
}

/** Valide la décision de routage renvoyée par Gemini (sans vérifier Neon). */
export function parseRoutingDecision(payload: unknown): RoutingDecision {
  if (!payload || typeof payload !== "object") {
    throw new Error("INVALID_ROUTING_DECISION");
  }

  const data = payload as Record<string, unknown>;

  if (!isDepartment(data.department)) {
    throw new Error("INVALID_ROUTING_DEPARTMENT");
  }
  if (!isAssigneeType(data.assignee_type)) {
    throw new Error("INVALID_ROUTING_ASSIGNEE");
  }
  if (!isNonEmptyString(data.routing_reason)) {
    throw new Error("INVALID_ROUTING_REASON");
  }
  if (!isNonEmptyString(data.recommended_action)) {
    throw new Error("INVALID_ROUTING_ACTION");
  }
  if (typeof data.escalation !== "boolean") {
    throw new Error("INVALID_ROUTING_ESCALATION");
  }

  let escalationReason: string | null = null;
  if (data.escalation) {
    if (!isNonEmptyString(data.escalation_reason)) {
      throw new Error("INVALID_ROUTING_ESCALATION_REASON");
    }
    escalationReason = data.escalation_reason.trim();
  } else if (
    data.escalation_reason === null ||
    data.escalation_reason === undefined ||
    data.escalation_reason === ""
  ) {
    escalationReason = null;
  } else if (typeof data.escalation_reason === "string") {
    escalationReason = data.escalation_reason.trim() || null;
  } else {
    throw new Error("INVALID_ROUTING_ESCALATION_REASON");
  }

  let assigneeId: string | null = null;
  if (
    data.assignee_id === null ||
    data.assignee_id === undefined ||
    data.assignee_id === ""
  ) {
    assigneeId = null;
  } else if (isUuid(data.assignee_id)) {
    assigneeId = data.assignee_id.trim();
  } else {
    throw new Error("INVALID_ROUTING_ASSIGNEE_ID");
  }

  return {
    department: data.department,
    assigneeType: data.assignee_type,
    assigneeId,
    assigneeName: null,
    routingReason: data.routing_reason.trim(),
    recommendedAction: data.recommended_action.trim(),
    escalation: data.escalation,
    escalationReason,
  };
}

/**
 * L'IA décide du service ; l'application attribue ensuite un collaborateur
 * actif via la rotation persistante Neon.
 */
export async function validateAndEnrichRouting(
  decision: RoutingDecision,
): Promise<RoutingDecision> {
  const department = assignmentDepartmentKey(
    decision.department,
  ) as RoutingDecision["department"];

  const member = await assignNextActiveTeamMember(department);
  if (!member) {
    throw new Error("INVALID_ROUTING_ASSIGNEE_ID");
  }

  return {
    ...decision,
    department,
    assigneeId: member.id,
    assigneeName: member.name,
  };
}
