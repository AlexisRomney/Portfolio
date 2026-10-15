import { DEMO_TICKETS } from "@gd/data/demo-tickets";
import type { Ticket } from "@gd/types/ticket";
import type { TicketMessage } from "@gd/types/ticketMessage";

export type DemoLocale = "fr" | "en";

/** Champs textuels de démonstration pouvant être localisés à l'affichage. */
export type DemoTicketLocalizedContent = {
  subject: string;
  message: string;
  subcategory: string | null;
  summary: string | null;
  action: string | null;
  usefulInformation: string[] | null;
  routingReason: string | null;
  recommendedAction: string | null;
  escalationReason: string | null;
  aiResponse: string | null;
  controlIssues: string[] | null;
  controlWarnings: string[] | null;
  reviewReason: string | null;
  correctedAction: string | null;
  controlSummary: string | null;
};

function pickContent(ticket: Ticket): DemoTicketLocalizedContent {
  return {
    subject: ticket.subject,
    message: ticket.message,
    subcategory: ticket.subcategory,
    summary: ticket.summary,
    action: ticket.action,
    usefulInformation: ticket.usefulInformation,
    routingReason: ticket.routingReason,
    recommendedAction: ticket.recommendedAction,
    escalationReason: ticket.escalationReason,
    aiResponse: ticket.aiResponse,
    controlIssues: ticket.controlIssues,
    controlWarnings: ticket.controlWarnings,
    reviewReason: ticket.reviewReason,
    correctedAction: ticket.correctedAction,
    controlSummary: ticket.controlSummary,
  };
}

/** Versions anglaises des tickets de démonstration (mêmes IDs que DEMO_TICKETS). */
export const DEMO_TICKETS_EN: Record<string, DemoTicketLocalizedContent> = {
  "11111111-1111-4111-8111-111111111111": {
    subject: "Invoice issue #234",
    message:
      "Invoice #234 shows an incorrect amount. The displayed total does not match the approved quote.",
    subcategory: "Invoice",
    summary: "The customer reports an amount error on invoice #234.",
    action: "Correct and resend the invoice",
    usefulInformation: null,
    routingReason: "The request concerns an invoiced amount error.",
    recommendedAction: "Verify the amount and resend a corrected invoice.",
    escalationReason: "High priority with financial impact for the customer.",
    aiResponse:
      "Hello Camille,\n\nWe have received your report regarding invoice #234. Our Billing team will verify the amount and get back to you.\n\nBest regards,\nThe Billing Team",
    controlIssues: [],
    controlWarnings: [],
    reviewReason: null,
    correctedAction: null,
    controlSummary:
      "The analysis, Billing routing, and response are consistent.",
  },
  "22222222-2222-4222-8222-222222222222": {
    subject: "Quote request",
    message: "Hello, could you please send us a quote for 20 licenses?",
    subcategory: "Quote request",
    summary: "The prospect wants a quote for 20 licenses.",
    action: "Prepare a sales quote",
    usefulInformation: null,
    routingReason: "Explicit request for a license quote.",
    recommendedAction: "Prepare and send a quote for 20 licenses.",
    escalationReason: null,
    aiResponse:
      "Hello Julien,\n\nThank you for your interest. We are preparing a quote for 20 licenses and will get back to you shortly.\n\nBest regards,\nThe Sales Team",
    controlIssues: [],
    controlWarnings: [],
    reviewReason: null,
    correctedAction: null,
    controlSummary: "Consistent sales request, without excessive promises.",
  },
  "33333333-3333-4333-8333-333333333333": {
    subject: "Forgotten password",
    message:
      "I can no longer sign in to my customer area after a password reset.",
    subcategory: "Password",
    summary: "The user cannot sign back in after a password reset.",
    action: "Access reset assistance",
    usefulInformation: null,
    routingReason: "Sign-in issue related to password / account access.",
    recommendedAction: "Help complete the reset and restore access.",
    escalationReason: null,
    aiResponse:
      "Hello Sophie,\n\nWe have received your request about signing in to your customer area. Our support team will help you complete the password reset.\n\nBest regards,\nThe Support Team",
    controlIssues: [],
    controlWarnings: [
      "The Support category and IT Support routing are close but acceptable.",
    ],
    reviewReason: null,
    correctedAction: null,
    controlSummary: "Control approved with a minor categorization warning.",
  },
  "44444444-4444-4444-8444-444444444444": {
    subject: "Account access blocked",
    message:
      "Hello, I have been unable to access my account since this morning. I have a client meeting at 3:00 PM.",
    subcategory: "Access / Account",
    summary: "The user can no longer access their account before a meeting.",
    action: "IT Support",
    usefulInformation: null,
    routingReason: "The request concerns an account access issue.",
    recommendedAction: "Restore account access as a priority.",
    escalationReason:
      "The issue is urgent and may affect a client meeting scheduled for 3:00 PM.",
    aiResponse:
      "Hello Thomas,\n\nWe have received your access issue. Your request is being handled as a priority by IT support.\n\nBest regards,\nThe Support Team",
    controlIssues: [],
    controlWarnings: [],
    reviewReason: null,
    correctedAction: null,
    controlSummary:
      "The produced information is consistent and the response contains no unverified promise.",
  },
  "55555555-5555-4555-8555-555555555555": {
    subject: "Contract renewal",
    message:
      "Our contract expires at the end of the month. Please prepare the renewal.",
    subcategory: "Contract",
    summary: "The customer requests renewal of their contract.",
    action: "Prepare the contract renewal",
    usefulInformation: null,
    routingReason: "Request related to contract renewal.",
    recommendedAction: "Prepare the contract renewal file.",
    escalationReason: null,
    aiResponse: null,
    controlIssues: null,
    controlWarnings: null,
    reviewReason: null,
    correctedAction: null,
    controlSummary: null,
  },
  "66666666-6666-4666-8666-666666666666": {
    subject: "Dashboard display bug",
    message: "On mobile, the dashboard charts do not display correctly.",
    subcategory: "Technical incident",
    summary: "Mobile chart display bug.",
    action: "Investigate the mobile frontend bug",
    usefulInformation: null,
    routingReason: "Display technical incident requiring IT support.",
    recommendedAction: "Investigate and fix the mobile display bug.",
    escalationReason: null,
    aiResponse:
      "Hello Laura,\n\nThank you for reporting this. We will investigate the chart display issue on mobile.\n\nBest regards,\nThe Support Team",
    controlIssues: [],
    controlWarnings: [],
    reviewReason: null,
    correctedAction: null,
    controlSummary: "Technical incident correctly analyzed and routed.",
  },
  "77777777-7777-4777-8777-777777777777": {
    subject: "Urgent request, needs clarification",
    message:
      "Hello, there is an issue with my file. It may be about the invoice, or access, I'm not sure. Someone should look into it quickly.",
    subcategory: null,
    summary:
      "Ambiguous urgent request that may concern billing or access.",
    action: "Clarify the need with the requester",
    usefulInformation: null,
    routingReason:
      "Insufficient information: several teams could be involved.",
    recommendedAction:
      "Contact the requester to clarify the issue before final assignment.",
    escalationReason:
      "High priority and ambiguity requiring human review.",
    aiResponse:
      "Hello Nadia,\n\nWe have received your message. To route you correctly, could you clarify whether this is an invoice issue or an access issue?\n\nBest regards,\nThe Support Team",
    controlIssues: [
      "The request is ambiguous and may concern several teams.",
    ],
    controlWarnings: [],
    reviewReason:
      "Insufficient information for reliable automation.",
    correctedAction: null,
    controlSummary:
      "Human review required before any automation.",
  },
};

const DEMO_TICKETS_FR: Record<string, DemoTicketLocalizedContent> =
  Object.fromEntries(DEMO_TICKETS.map((ticket) => [ticket.id, pickContent(ticket)]));

export const DEMO_TICKET_IDS = new Set(Object.keys(DEMO_TICKETS_FR));

export function isDemoTicketId(ticketId: string): boolean {
  return DEMO_TICKET_IDS.has(ticketId);
}

function sameText(a: string | null | undefined, b: string | null | undefined): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return a === b;
}

function sameStringArray(
  a: string[] | null | undefined,
  b: string[] | null | undefined,
): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

/**
 * Applique le contenu de démonstration EN uniquement si la valeur courante
 * correspond encore à la version FR ou EN de seed (pas une saisie/génération utilisateur).
 */
function localizeField<T extends string | null>(
  current: T,
  frValue: T,
  enValue: T,
): T {
  if (sameText(current, frValue) || sameText(current, enValue)) {
    return enValue;
  }
  return current;
}

function localizeStringArray(
  current: string[] | null,
  frValue: string[] | null,
  enValue: string[] | null,
): string[] | null {
  if (sameStringArray(current, frValue) || sameStringArray(current, enValue)) {
    return enValue;
  }
  return current;
}

/**
 * Overlay d'affichage : Neon / FR inchangés. En `en`, remplace le contenu seed
 * des tickets de démo. Les overrides locaux restent appliqués à part.
 */
export function applyDemoTicketLocale(ticket: Ticket, locale: DemoLocale): Ticket {
  if (locale !== "en") return ticket;
  const fr = DEMO_TICKETS_FR[ticket.id];
  const en = DEMO_TICKETS_EN[ticket.id];
  if (!fr || !en) return ticket;

  return {
    ...ticket,
    subject: localizeField(ticket.subject, fr.subject, en.subject),
    message: localizeField(ticket.message, fr.message, en.message),
    subcategory: localizeField(ticket.subcategory, fr.subcategory, en.subcategory),
    summary: localizeField(ticket.summary, fr.summary, en.summary),
    action: localizeField(ticket.action, fr.action, en.action),
    usefulInformation: localizeStringArray(
      ticket.usefulInformation,
      fr.usefulInformation,
      en.usefulInformation,
    ),
    routingReason: localizeField(
      ticket.routingReason,
      fr.routingReason,
      en.routingReason,
    ),
    recommendedAction: localizeField(
      ticket.recommendedAction,
      fr.recommendedAction,
      en.recommendedAction,
    ),
    escalationReason: localizeField(
      ticket.escalationReason,
      fr.escalationReason,
      en.escalationReason,
    ),
    aiResponse: localizeField(ticket.aiResponse, fr.aiResponse, en.aiResponse),
    controlIssues: localizeStringArray(
      ticket.controlIssues,
      fr.controlIssues,
      en.controlIssues,
    ),
    controlWarnings: localizeStringArray(
      ticket.controlWarnings,
      fr.controlWarnings,
      en.controlWarnings,
    ),
    reviewReason: localizeField(
      ticket.reviewReason,
      fr.reviewReason,
      en.reviewReason,
    ),
    correctedAction: localizeField(
      ticket.correctedAction,
      fr.correctedAction,
      en.correctedAction,
    ),
    controlSummary: localizeField(
      ticket.controlSummary,
      fr.controlSummary,
      en.controlSummary,
    ),
  };
}

/** Localise un message seed de conversation de démo ; laisse intact le reste. */
export function applyDemoMessageLocale(
  message: TicketMessage,
  locale: DemoLocale,
): TicketMessage {
  if (locale !== "en" || !isDemoTicketId(message.ticketId)) return message;
  const fr = DEMO_TICKETS_FR[message.ticketId];
  const en = DEMO_TICKETS_EN[message.ticketId];
  if (!fr || !en) return message;

  if (sameText(message.content, fr.message)) {
    return { ...message, content: en.message };
  }
  if (fr.aiResponse && sameText(message.content, fr.aiResponse)) {
    return { ...message, content: en.aiResponse ?? message.content };
  }
  if (en.aiResponse && sameText(message.content, en.aiResponse)) {
    return message;
  }
  return message;
}

export function applyDemoMessagesLocale(
  messages: TicketMessage[],
  locale: DemoLocale,
): TicketMessage[] {
  if (locale !== "en") return messages;
  return messages.map((message) => applyDemoMessageLocale(message, locale));
}

/** Exposé pour les tests / debug : clés localisées uniquement. */
export function getDemoLocalizedContent(
  ticketId: string,
  locale: DemoLocale,
): DemoTicketLocalizedContent | null {
  if (locale === "en") return DEMO_TICKETS_EN[ticketId] ?? null;
  return DEMO_TICKETS_FR[ticketId] ?? null;
}
