import type { AIAnalysis } from "@gd/types/aiAnalysis";
import type { ControlDecision } from "@gd/types/control";
import type { RoutingDecision } from "@gd/types/routing";
import type { Ticket } from "@gd/types/ticket";
import type { TicketMessage } from "@gd/types/ticketMessage";
import type { Locale } from "@gd/i18n";

export type AnalyzeCreatePayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type AnalyzeRequestResult =
  | {
      ok: true;
      ticket: Ticket;
      analysis: AIAnalysis | null;
      analysisError: string | null;
      routing: RoutingDecision | null;
      routingError: string | null;
      responseError: string | null;
      control: ControlDecision | null;
      controlError: string | null;
    }
  | {
      ok: false;
      error: string;
      errors?: Record<string, string>;
    };

type ApiPayload = {
  ticket?: Ticket;
  analysis?: AIAnalysis | null;
  analysisError?: string | null;
  routing?: RoutingDecision | null;
  routingError?: string | null;
  responseError?: string | null;
  control?: ControlDecision | null;
  controlError?: string | null;
  error?: string;
  errors?: Record<string, string>;
};

async function postAnalyze(
  body: Record<string, unknown>,
  fallbackError: string,
): Promise<AnalyzeRequestResult> {
  try {
    const response = await fetch("/gestion-demandes/api/analyze-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as ApiPayload;

    if (!response.ok || !data.ticket) {
      return {
        ok: false,
        error: data.error || fallbackError,
        errors: data.errors,
      };
    }

    return {
      ok: true,
      ticket: data.ticket,
      analysis: data.analysis ?? null,
      analysisError: data.analysisError ?? null,
      routing: data.routing ?? null,
      routingError: data.routingError ?? null,
      responseError: data.responseError ?? null,
      control: data.control ?? null,
      controlError: data.controlError ?? null,
    };
  } catch {
    return {
      ok: false,
      error:
        "Impossible de contacter le serveur. Vérifiez votre connexion.",
    };
  }
}

/**
 * Orchestre création + analyse + routage + réponse + contrôle (Neon + Gemini).
 */
export async function submitTicketForAnalysis(
  payload: AnalyzeCreatePayload,
  locale: Locale = "en",
): Promise<AnalyzeRequestResult> {
  return postAnalyze({ ...payload, locale }, "Impossible d'enregistrer la demande.");
}

export async function reanalyzeTicket(
  ticketId: string,
  locale: Locale = "en",
): Promise<AnalyzeRequestResult> {
  return postAnalyze(
    { ticketId, locale },
    "Impossible de relancer l'analyse.",
  );
}

export async function rerouteTicket(
  ticketId: string,
): Promise<AnalyzeRequestResult> {
  return postAnalyze(
    { ticketId, mode: "route_request" },
    "Impossible de relancer le routage.",
  );
}

export async function recontrolTicket(
  ticketId: string,
): Promise<AnalyzeRequestResult> {
  return postAnalyze(
    { ticketId, mode: "control_request" },
    "Impossible de relancer le contrôle.",
  );
}

export async function regenerateTicketResponse(
  ticketId: string,
  statusContext: Ticket["status"],
  locale: Locale = "en",
): Promise<AnalyzeRequestResult> {
  return postAnalyze(
    { ticketId, mode: "generate_response", statusContext, locale },
    "Impossible de régénérer la réponse.",
  );
}

export type GenerateCurrentResponseResult =
  | { ok: true; aiResponse: string }
  | { ok: false; error: string };

/** Génère une proposition depuis l'état navigateur, sans relancer le pipeline. */
export async function generateCurrentTicketResponse(
  ticket: Ticket,
  conversation: TicketMessage[],
  locale: Locale,
): Promise<GenerateCurrentResponseResult> {
  try {
    const response = await fetch("/gestion-demandes/api/generate-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketId: ticket.id,
        ticket,
        conversation,
        locale,
      }),
    });
    const data = (await response.json()) as {
      aiResponse?: string;
      error?: string;
    };

    if (!response.ok || !data.aiResponse) {
      return {
        ok: false,
        error: data.error || "Impossible de générer la réponse.",
      };
    }
    return { ok: true, aiResponse: data.aiResponse };
  } catch {
    return {
      ok: false,
      error: "Impossible de contacter le serveur. Vérifiez votre connexion.",
    };
  }
}

export type ResolveTicketResult =
  | {
      ok: true;
      ticket: Ticket;
      analysis: AIAnalysis | null;
      analysisError: string | null;
      routing: RoutingDecision | null;
      routingError: string | null;
      responseError: string | null;
      control: ControlDecision | null;
      controlError: string | null;
      autoSent: boolean;
      autoSendSkipped: boolean;
    }
  | {
      ok: false;
      error: string;
      errors?: Record<string, string>;
    };

/**
 * Clôture : réponse IA finale + contrôle + envoi auto si la politique le permet.
 */
export async function resolveTicketWithClosingResponse(
  ticketId: string,
  locale: Locale = "en",
): Promise<ResolveTicketResult> {
  try {
    const response = await fetch("/gestion-demandes/api/analyze-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, mode: "resolve_ticket", locale }),
    });

    const data = (await response.json()) as ApiPayload & {
      autoSent?: boolean;
      autoSendSkipped?: boolean;
    };

    if (!response.ok || !data.ticket) {
      return {
        ok: false,
        error: data.error || "Impossible de résoudre la demande.",
        errors: data.errors,
      };
    }

    return {
      ok: true,
      ticket: data.ticket,
      analysis: data.analysis ?? null,
      analysisError: data.analysisError ?? null,
      routing: data.routing ?? null,
      routingError: data.routingError ?? null,
      responseError: data.responseError ?? null,
      control: data.control ?? null,
      controlError: data.controlError ?? null,
      autoSent: data.autoSent === true,
      autoSendSkipped: data.autoSendSkipped === true,
    };
  } catch {
    return {
      ok: false,
      error:
        "Impossible de contacter le serveur. Vérifiez votre connexion.",
    };
  }
}

export async function runTicketAutomation(
  ticketId: string,
): Promise<AnalyzeRequestResult> {
  return postAnalyze(
    { ticketId, mode: "run_automation" },
    "Impossible de lancer l'automatisation.",
  );
}

export async function saveTicketAiResponse(
  ticketId: string,
  aiResponse: string,
): Promise<
  | { ok: true; ticket: Ticket; controlError: string | null }
  | { ok: false; error: string }
> {
  try {
    const response = await fetch(`/gestion-demandes/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiResponse }),
    });

    const data = (await response.json()) as {
      ticket?: Ticket;
      error?: string;
    };

    if (!response.ok || !data.ticket) {
      return {
        ok: false,
        error: data.error || "Impossible d'enregistrer la réponse.",
      };
    }

    // Le contrôle doit porter sur la version humaine finale persistée.
    const controlled = await recontrolTicket(ticketId);
    if (!controlled.ok) {
      return {
        ok: true,
        ticket: data.ticket,
        controlError:
          "Réponse enregistrée, mais le contrôle IA n'a pas pu être relancé.",
      };
    }

    return {
      ok: true,
      ticket: controlled.ticket,
      controlError: controlled.controlError,
    };
  } catch {
    return {
      ok: false,
      error:
        "Impossible de contacter le serveur. Vérifiez votre connexion.",
    };
  }
}
