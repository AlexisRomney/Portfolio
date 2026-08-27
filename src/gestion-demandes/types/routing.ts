export type Department =
  | "IT Support"
  | "Facturation"
  | "Comptabilité"
  | "Commercial"
  | "Administratif"
  | "Ressources humaines"
  | "Support Client"
  | "Direction";

export type AssigneeType =
  | "support_team"
  | "billing_team"
  | "sales_team"
  | "admin_team"
  | "hr_team"
  | "management"
  | "human_review";

export type RoutingDecision = {
  department: Department;
  assigneeType: AssigneeType;
  assigneeId: string | null;
  assigneeName: string | null;
  routingReason: string;
  recommendedAction: string;
  escalation: boolean;
  escalationReason: string | null;
};

export const DEPARTMENTS: Department[] = [
  "IT Support",
  "Facturation",
  "Comptabilité",
  "Commercial",
  "Administratif",
  "Ressources humaines",
  "Support Client",
  "Direction",
];

export const ASSIGNEE_TYPES: AssigneeType[] = [
  "support_team",
  "billing_team",
  "sales_team",
  "admin_team",
  "hr_team",
  "management",
  "human_review",
];
