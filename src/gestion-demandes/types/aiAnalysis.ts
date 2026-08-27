import type { TicketCategory } from "@gd/types/ticket";

export type AIPriority = "high" | "medium" | "low";

export type AISentiment = "positive" | "neutral" | "negative";

export type AIAnalysis = {
  category: TicketCategory;
  subcategory: string | null;
  priority: AIPriority;
  sentiment: AISentiment;
  summary: string;
  action: string;
  /** Faits exploitables extraits du message (sans invention). */
  usefulInformation: string[];
};

export const AI_PRIORITIES: AIPriority[] = ["high", "medium", "low"];

export const AI_SENTIMENTS: AISentiment[] = [
  "positive",
  "neutral",
  "negative",
];
