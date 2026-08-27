export type TicketPriority = "high" | "medium" | "low";

export type TicketStatus = "new" | "pending" | "in_progress" | "resolved";

export type TicketSentiment = "positive" | "neutral" | "negative";

export type TicketCategory =
  | "IT"
  | "Facturation"
  | "Commercial"
  | "Support"
  | "Administratif"
  | "Technique"
  | "Autre";

export type TicketDepartment =
  | "IT Support"
  | "Facturation"
  | "Comptabilité"
  | "Commercial"
  | "Administratif"
  | "Ressources humaines"
  | "Support Client"
  | "Direction";

export type TicketAssigneeType =
  | "support_team"
  | "billing_team"
  | "sales_team"
  | "admin_team"
  | "hr_team"
  | "management"
  | "human_review";

export type Ticket = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: TicketCategory | null;
  subcategory: string | null;
  priority: TicketPriority | null;
  sentiment: TicketSentiment | null;
  summary: string | null;
  action: string | null;
  usefulInformation: string[] | null;
  department: TicketDepartment | null;
  assigneeType: TicketAssigneeType | null;
  assigneeId: string | null;
  assigneeName: string | null;
  routingReason: string | null;
  recommendedAction: string | null;
  escalation: boolean | null;
  escalationReason: string | null;
  status: TicketStatus;
  aiResponse: string | null;
  controlApproved: boolean | null;
  controlScore: number | null;
  controlIssues: string[] | null;
  controlWarnings: string[] | null;
  requiresHumanReview: boolean | null;
  reviewReason: string | null;
  correctedPriority: TicketPriority | null;
  correctedDepartment: TicketDepartment | null;
  correctedAction: string | null;
  controlSummary: string | null;
  controlAttemptVersion: number;
  controlCompletedVersion: number | null;
  processedBy: string | null;
  processedAt: string | null;
  automationStatus: string | null;
  responseSent: boolean | null;
  responseSentAt: string | null;
  responseSentMode: "manual" | "automatic" | null;
  /** Ticket créé depuis la démo portfolio (mutable uniquement en mode démo). */
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TicketCreateInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: TicketCategory | null;
  subcategory?: string | null;
  priority?: TicketPriority | null;
  sentiment?: TicketSentiment | null;
  summary?: string | null;
  action?: string | null;
  usefulInformation?: string[] | null;
  department?: TicketDepartment | null;
  assigneeType?: TicketAssigneeType | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  routingReason?: string | null;
  recommendedAction?: string | null;
  escalation?: boolean | null;
  escalationReason?: string | null;
  status?: TicketStatus;
  aiResponse?: string | null;
  controlApproved?: boolean | null;
  controlScore?: number | null;
  controlIssues?: string[] | null;
  controlWarnings?: string[] | null;
  requiresHumanReview?: boolean | null;
  reviewReason?: string | null;
  correctedPriority?: TicketPriority | null;
  correctedDepartment?: TicketDepartment | null;
  correctedAction?: string | null;
  controlSummary?: string | null;
  controlAttemptVersion?: number;
  controlCompletedVersion?: number | null;
  processedBy?: string | null;
  processedAt?: string | null;
  automationStatus?: string | null;
  responseSent?: boolean | null;
  responseSentAt?: string | null;
  responseSentMode?: "manual" | "automatic" | null;
  isDemo?: boolean;
};

export type TicketUpdateInput = Partial<
  Omit<Ticket, "id" | "createdAt" | "updatedAt">
>;

export const TICKET_CATEGORIES: TicketCategory[] = [
  "IT",
  "Facturation",
  "Commercial",
  "Support",
  "Administratif",
  "Technique",
  "Autre",
];

export const TICKET_PRIORITIES: TicketPriority[] = ["high", "medium", "low"];

export const TICKET_STATUSES: TicketStatus[] = [
  "new",
  "pending",
  "in_progress",
  "resolved",
];

export const TICKET_SENTIMENTS: TicketSentiment[] = [
  "positive",
  "neutral",
  "negative",
];

export const TICKET_DEPARTMENTS: TicketDepartment[] = [
  "IT Support",
  "Facturation",
  "Comptabilité",
  "Commercial",
  "Administratif",
  "Ressources humaines",
  "Support Client",
  "Direction",
];

export const TICKET_ASSIGNEE_TYPES: TicketAssigneeType[] = [
  "support_team",
  "billing_team",
  "sales_team",
  "admin_team",
  "hr_team",
  "management",
  "human_review",
];
