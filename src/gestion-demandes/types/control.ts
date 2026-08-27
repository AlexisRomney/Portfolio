import type { Department } from "@gd/types/routing";
import type { TicketPriority } from "@gd/types/ticket";

export type ControlDecision = {
  approved: boolean;
  score: number;
  issues: string[];
  warnings: string[];
  requiresHumanReview: boolean;
  reviewReason: string | null;
  correctedPriority: TicketPriority | null;
  correctedDepartment: Department | null;
  correctedAction: string | null;
  controlSummary: string;
};
