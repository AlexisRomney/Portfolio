import {
  AI_PRIORITIES,
  AI_SENTIMENTS,
  type AIAnalysis,
  type AIPriority,
  type AISentiment,
} from "@gd/types/aiAnalysis";
import {
  TICKET_CATEGORIES,
  type TicketCategory,
} from "@gd/types/ticket";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isCategory(value: unknown): value is TicketCategory {
  return (
    typeof value === "string" &&
    (TICKET_CATEGORIES as string[]).includes(value)
  );
}

function isAIPriority(value: unknown): value is AIPriority {
  return (
    typeof value === "string" &&
    (AI_PRIORITIES as string[]).includes(value)
  );
}

function isAISentiment(value: unknown): value is AISentiment {
  return (
    typeof value === "string" &&
    (AI_SENTIMENTS as string[]).includes(value)
  );
}

/** Valide et normalise la réponse JSON du modèle IA. */
export function parseAIAnalysis(payload: unknown): AIAnalysis {
  if (!payload || typeof payload !== "object") {
    throw new Error("INVALID_AI_ANALYSIS");
  }

  const data = payload as Record<string, unknown>;

  if (!isCategory(data.category)) {
    throw new Error("INVALID_AI_CATEGORY");
  }
  if (!isAIPriority(data.priority)) {
    throw new Error("INVALID_AI_PRIORITY");
  }
  if (!isAISentiment(data.sentiment)) {
    throw new Error("INVALID_AI_SENTIMENT");
  }
  if (!isNonEmptyString(data.summary)) {
    throw new Error("INVALID_AI_SUMMARY");
  }
  if (!isNonEmptyString(data.action)) {
    throw new Error("INVALID_AI_ACTION");
  }

  let subcategory: string | null = null;
  if (data.subcategory === null || data.subcategory === undefined) {
    subcategory = null;
  } else if (typeof data.subcategory === "string") {
    const trimmed = data.subcategory.trim();
    subcategory = trimmed.length > 0 ? trimmed : null;
  } else {
    throw new Error("INVALID_AI_SUBCATEGORY");
  }

  let usefulInformation: string[] = [];
  if (data.useful_information === null || data.useful_information === undefined) {
    usefulInformation = [];
  } else if (Array.isArray(data.useful_information)) {
    usefulInformation = data.useful_information
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 12);
  } else if (typeof data.useful_information === "string") {
    const trimmed = data.useful_information.trim();
    usefulInformation = trimmed ? [trimmed] : [];
  } else {
    throw new Error("INVALID_AI_USEFUL_INFORMATION");
  }

  return {
    category: data.category,
    subcategory,
    priority: data.priority,
    sentiment: data.sentiment,
    summary: data.summary.trim(),
    action: data.action.trim(),
    usefulInformation,
  };
}
