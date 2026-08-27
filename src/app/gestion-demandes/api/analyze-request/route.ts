import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@gd/lib/db/client";
import { assertDemoTicketWritable } from "@gd/lib/demo-guard";
import { isDemoMode } from "@gd/lib/demo-isolation";
import { applyDemoAutomationEligibility } from "@gd/lib/demo-workflow";
import { enforceRateLimit } from "@gd/lib/rateLimit";
import {
  analyzeRequestMessage,
  controlRequest,
  generateCustomerResponse,
  routeRequest,
} from "@gd/services/aiService";
import {
  createTicketMessage,
  ensureTicketConversation,
  formatConversationForAi,
  replaceTicketResponseDraft,
} from "@gd/services/ticketMessageService";
import {
  beginTicketControlAttempt,
  completeTicketControlAttempt,
  createTicket,
  getTicketById,
  updateTicket,
} from "@gd/services/ticketService";
import { sendCustomerResponse } from "@gd/services/customerResponseService";
import { getAppSettings } from "@gd/services/appSettingsService";
import { isAutoSendCustomerResponseAllowed } from "@gd/lib/autoSendPolicy";
import { triggerProcessTicketIfEligible } from "@gd/services/triggerProcessTicket";
import type { AIAnalysis } from "@gd/types/aiAnalysis";
import type { ControlDecision } from "@gd/types/control";
import type { RoutingDecision } from "@gd/types/routing";
import {
  TICKET_STATUSES,
  type Ticket,
  type TicketStatus,
  type TicketUpdateInput,
} from "@gd/types/ticket";

export const runtime = "nodejs";

type AnalyzeBody = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  ticketId?: unknown;
  mode?: unknown;
  statusContext?: unknown;
  locale?: unknown;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function userFacingAiError(code: string): string {
  switch (code) {
    case "AI_NOT_CONFIGURED":
      return "L'analyse IA n'est pas configurée. Ajoutez une clé API côté serveur.";
    case "AI_INVALID_JSON":
    case "INVALID_AI_ANALYSIS":
    case "INVALID_AI_CATEGORY":
    case "INVALID_AI_PRIORITY":
    case "INVALID_AI_SENTIMENT":
    case "INVALID_AI_SUMMARY":
    case "INVALID_AI_ACTION":
    case "INVALID_AI_SUBCATEGORY":
    case "INVALID_AI_USEFUL_INFORMATION":
    case "INVALID_AI_RESPONSE":
    case "AI_EMPTY_RESPONSE":
      return "L'analyse IA a renvoyé une réponse invalide. Vous pourrez la relancer plus tard.";
    case "AI_PROVIDER_ERROR":
      return "L'analyse IA a échoué. La demande a bien été enregistrée ; vous pourrez relancer l'analyse plus tard.";
    default:
      return "L'analyse IA est temporairement indisponible.";
  }
}

function userFacingRoutingError(code: string): string {
  switch (code) {
    case "AI_NOT_CONFIGURED":
      return "Le routage automatique n'est pas configuré. Ajoutez une clé API côté serveur.";
    case "AI_PROVIDER_ERROR":
    case "AI_EMPTY_RESPONSE":
    case "AI_INVALID_JSON":
    case "INVALID_ROUTING_DECISION":
    case "INVALID_ROUTING_DEPARTMENT":
    case "INVALID_ROUTING_ASSIGNEE":
    case "INVALID_ROUTING_ASSIGNEE_ID":
    case "INVALID_ROUTING_REASON":
    case "INVALID_ROUTING_ACTION":
    case "INVALID_ROUTING_ESCALATION":
    case "INVALID_ROUTING_ESCALATION_REASON":
      return "Le routage automatique n'a pas pu être effectué.";
    default:
      return "Le routage automatique n'a pas pu être effectué.";
  }
}

function userFacingResponseError(code: string): string {
  switch (code) {
    case "AI_NOT_CONFIGURED":
      return "La génération de réponse n'est pas configurée. Ajoutez une clé API côté serveur.";
    case "AI_PROVIDER_ERROR":
    case "AI_EMPTY_RESPONSE":
    case "INVALID_AI_RESPONSE":
    case "AI_INVALID_JSON":
      return "La réponse IA n'a pas pu être générée. Vous pourrez réessayer ultérieurement.";
    default:
      return "La réponse IA n'a pas pu être générée. Vous pourrez réessayer ultérieurement.";
  }
}

function userFacingControlError(code: string): string {
  switch (code) {
    case "AI_NOT_CONFIGURED":
      return "Le contrôle automatique n'est pas configuré. Ajoutez une clé API côté serveur.";
    case "AI_PROVIDER_ERROR":
    case "AI_EMPTY_RESPONSE":
    case "AI_INVALID_JSON":
    case "INVALID_CONTROL_DECISION":
    case "INVALID_CONTROL_APPROVED":
    case "INVALID_CONTROL_SCORE":
    case "INVALID_CONTROL_ISSUES":
    case "INVALID_CONTROL_WARNINGS":
    case "INVALID_CONTROL_HUMAN_REVIEW":
    case "INVALID_CONTROL_REVIEW_REASON":
    case "INVALID_CONTROL_CORRECTED_PRIORITY":
    case "INVALID_CONTROL_CORRECTED_DEPARTMENT":
    case "INVALID_CONTROL_CORRECTED_ACTION":
    case "INVALID_CONTROL_SUMMARY":
      return "Le contrôle automatique n'a pas pu être effectué. Une vérification manuelle est recommandée.";
    default:
      return "Le contrôle automatique n'a pas pu être effectué. Une vérification manuelle est recommandée.";
  }
}

function userFacingDbError(code: string): { status: number; message: string } {
  if (code === "DB_NOT_CONFIGURED") {
    return {
      status: 503,
      message:
        "La base de données n'est pas configurée. Ajoutez DATABASE_URL côté serveur.",
    };
  }

  return {
    status: 500,
    message: "Impossible d'enregistrer la demande. Veuillez réessayer.",
  };
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateCreatePayload(body: AnalyzeBody) {
  const name = asTrimmedString(body.name);
  const email = asTrimmedString(body.email);
  const subject = asTrimmedString(body.subject);
  const message = asTrimmedString(body.message);
  const errors: Record<string, string> = {};

  if (!name) errors.name = "Le nom est obligatoire.";
  if (!email) errors.email = "L'e-mail est obligatoire.";
  else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Veuillez saisir une adresse e-mail valide.";
  }
  if (!subject) errors.subject = "Le sujet est obligatoire.";
  if (!message) errors.message = "Le message est obligatoire.";
  else if (message.length > 8000) {
    errors.message = "Le message est trop long.";
  }

  return { name, email, subject, message, errors };
}

function analysisToTicketFields(analysis: AIAnalysis) {
  return {
    category: analysis.category,
    subcategory: analysis.subcategory,
    priority: analysis.priority,
    sentiment: analysis.sentiment,
    summary: analysis.summary,
    action: analysis.action,
    usefulInformation: analysis.usefulInformation,
  };
}

function routingToTicketFields(routing: RoutingDecision): TicketUpdateInput {
  return {
    department: routing.department,
    assigneeType: routing.assigneeType,
    assigneeId: routing.assigneeId,
    assigneeName: routing.assigneeName,
    routingReason: routing.routingReason,
    recommendedAction: routing.recommendedAction,
    escalation: routing.escalation,
    escalationReason: routing.escalationReason,
  };
}

function emptyRoutingFields(): TicketUpdateInput {
  return {
    department: null,
    assigneeType: null,
    assigneeId: null,
    assigneeName: null,
    routingReason: null,
    recommendedAction: null,
    escalation: null,
    escalationReason: null,
  };
}

function controlToTicketFields(control: ControlDecision): TicketUpdateInput {
  return {
    controlApproved: control.approved,
    controlScore: control.score,
    controlIssues: control.issues,
    controlWarnings: control.warnings,
    requiresHumanReview: control.requiresHumanReview,
    reviewReason: control.reviewReason,
    correctedPriority: control.correctedPriority,
    correctedDepartment: control.correctedDepartment,
    correctedAction: control.correctedAction,
    controlSummary: control.controlSummary,
  };
}

function emptyControlFields(): TicketUpdateInput {
  return {
    controlApproved: null,
    controlScore: null,
    controlIssues: null,
    controlWarnings: null,
    requiresHumanReview: null,
    reviewReason: null,
    correctedPriority: null,
    correctedDepartment: null,
    correctedAction: null,
    controlSummary: null,
  };
}

function ticketToAnalysis(ticket: Ticket): AIAnalysis | null {
  if (
    !ticket.category ||
    !ticket.priority ||
    !ticket.sentiment ||
    !ticket.summary ||
    !ticket.action
  ) {
    return null;
  }

  return {
    category: ticket.category,
    subcategory: ticket.subcategory,
    priority: ticket.priority,
    sentiment: ticket.sentiment,
    summary: ticket.summary,
    action: ticket.action,
    usefulInformation: ticket.usefulInformation ?? [],
  };
}

function ticketToRouting(ticket: Ticket): RoutingDecision | null {
  if (
    !ticket.department ||
    !ticket.assigneeType ||
    !ticket.routingReason ||
    !ticket.recommendedAction ||
    typeof ticket.escalation !== "boolean"
  ) {
    return null;
  }

  return {
    department: ticket.department,
    assigneeType: ticket.assigneeType,
    assigneeId: ticket.assigneeId,
    assigneeName: ticket.assigneeName,
    routingReason: ticket.routingReason,
    recommendedAction: ticket.recommendedAction,
    escalation: ticket.escalation,
    escalationReason: ticket.escalationReason,
  };
}

async function runAnalysis(
  message: string,
  conversationHistory?: string,
): Promise<{ analysis: AIAnalysis | null; analysisError: string | null }> {
  try {
    const analysis = await analyzeRequestMessage(message, {
      conversationHistory,
    });
    return { analysis, analysisError: null };
  } catch (error) {
    const code = error instanceof Error ? error.message : "AI_PROVIDER_ERROR";
    return { analysis: null, analysisError: userFacingAiError(code) };
  }
}

async function runRouting(input: {
  message: string;
  subject: string;
  analysis: AIAnalysis;
}): Promise<{
  routing: RoutingDecision | null;
  routingError: string | null;
}> {
  try {
    const routing = await routeRequest(input);
    return { routing, routingError: null };
  } catch (error) {
    const code = error instanceof Error ? error.message : "AI_PROVIDER_ERROR";
    return {
      routing: null,
      routingError: userFacingRoutingError(code),
    };
  }
}

async function runResponseGeneration(input: {
  requesterName: string;
  subject: string;
  message: string;
  analysis: AIAnalysis;
  status: TicketStatus;
  conversationHistory?: string;
  assigneeName?: string | null;
  department?: string | null;
  recommendedAction?: string | null;
  closingForResolution?: boolean;
  responseLanguage?: "fr" | "en";
}): Promise<{ aiResponse: string | null; responseError: string | null }> {
  try {
    const aiResponse = await generateCustomerResponse(input);
    return { aiResponse, responseError: null };
  } catch (error) {
    const code = error instanceof Error ? error.message : "AI_PROVIDER_ERROR";
    return { aiResponse: null, responseError: userFacingResponseError(code) };
  }
}

async function runControl(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  analysis: AIAnalysis;
  routing: RoutingDecision | null;
  aiResponse: string | null;
}): Promise<{
  control: ControlDecision | null;
  controlError: string | null;
}> {
  try {
    const control = await controlRequest(input);
    return { control, controlError: null };
  } catch (error) {
    const code = error instanceof Error ? error.message : "AI_PROVIDER_ERROR";
    return {
      control: null,
      controlError: userFacingControlError(code),
    };
  }
}

async function runPersistedControl(
  ticketId: string,
  input: Parameters<typeof runControl>[0],
): Promise<{
  ticket: Ticket;
  control: ControlDecision | null;
  controlError: string | null;
}> {
  const attempt = await beginTicketControlAttempt(ticketId);
  if (!attempt) {
    throw new Error("TICKET_NOT_FOUND");
  }

  const result = await runControl(input);
  if (!result.control) {
    return { ticket: attempt, ...result };
  }

  const control = applyDemoAutomationEligibility(
    result.control,
    input.routing ?? null,
  );
  if (!control) {
    return { ticket: attempt, control: null, controlError: result.controlError };
  }

  const completed = await completeTicketControlAttempt(
    ticketId,
    attempt.controlAttemptVersion,
    controlToTicketFields(control),
  );
  if (completed) {
    return { ticket: completed, control, controlError: result.controlError };
  }

  // Une tentative plus récente a démarré pendant l'appel IA. Le résultat
  // tardif est ignoré et ne doit pas être présenté comme le contrôle courant.
  const latest = await getTicketById(ticketId);
  if (!latest) {
    throw new Error("TICKET_NOT_FOUND");
  }
  return {
    ticket: latest,
    control: null,
    controlError:
      "Ce contrôle a été remplacé par une tentative plus récente.",
  };
}

async function jsonResult(payload: {
  ticket: Ticket;
  analysis: AIAnalysis | null;
  analysisError: string | null;
  routing: RoutingDecision | null;
  routingError: string | null;
  control: ControlDecision | null;
  controlError: string | null;
  responseError: string | null;
}) {
  // Déclenchement non bloquant sur l'exécution : on attend seulement la mise en file.
  // En cas d'échec Trigger.dev, le ticket Neon déjà persisté reste intact.
  const automation = await triggerProcessTicketIfEligible(payload.ticket);

  // Recharge le ticket pour exposer automationStatus (pending/failed) à l'UI.
  const fresh =
    automation.triggered || automation.error
      ? ((await getTicketById(payload.ticket.id)) ?? payload.ticket)
      : payload.ticket;

  return NextResponse.json({
    ...payload,
    ticket: fresh,
    automation,
  });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    const { status, message } = userFacingDbError("DB_NOT_CONFIGURED");
    return NextResponse.json({ error: message }, { status });
  }

  const limit = enforceRateLimit(request, "analyze", 8, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "Trop de demandes en peu de temps. Réessayez dans quelques instants.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  }

  let body: AnalyzeBody;
  try {
    body = (await request.json()) as AnalyzeBody;
  } catch {
    return NextResponse.json(
      { error: "Le corps de la requête est invalide." },
      { status: 400 },
    );
  }

  const ticketId =
    typeof body.ticketId === "string" ? body.ticketId.trim() : "";
  const mode = typeof body.mode === "string" ? body.mode.trim() : "";
  const requestedStatus =
    typeof body.statusContext === "string" &&
    (TICKET_STATUSES as string[]).includes(body.statusContext)
      ? (body.statusContext as TicketStatus)
      : null;
  const responseLanguage = body.locale === "en" ? "en" : "fr";

  if (ticketId) {
    const blocked = await assertDemoTicketWritable(ticketId);
    if (blocked) return blocked;
  }

  try {
    // Relance manuelle de l'automatisation (sans relancer Gemini).
    // Utile après une validation humaine / contrôle devenu éligible.
    if (ticketId && mode === "run_automation") {
      const existing = await getTicketById(ticketId);
      if (!existing) {
        return NextResponse.json(
          { error: "Ticket introuvable." },
          { status: 404 },
        );
      }

      return jsonResult({
        ticket: existing,
        analysis: ticketToAnalysis(existing),
        analysisError: null,
        routing: ticketToRouting(existing),
        routingError: null,
        responseError: null,
        control: null,
        controlError: null,
      });
    }

    // Clôture manuelle : status Neon = resolved, puis réponse + contrôle + envoi.
    if (ticketId && mode === "resolve_ticket") {
      const existing = await getTicketById(ticketId);
      if (!existing) {
        return NextResponse.json(
          { error: "Ticket introuvable." },
          { status: 404 },
        );
      }

      // Persistance serveur immédiate du statut (visible par tous les navigateurs).
      let updated =
        (await updateTicket(ticketId, { status: "resolved" })) ?? existing;

      const analysis = ticketToAnalysis(updated);
      if (!analysis) {
        return NextResponse.json({
          ticket: updated,
          analysis: null,
          analysisError: null,
          routing: ticketToRouting(updated),
          routingError: null,
          responseError:
            "L'analyse IA est requise avant de générer une réponse de clôture.",
          control: null,
          controlError: null,
          autoSent: false,
          autoSendSkipped: true,
        });
      }

      const historyMessages = await ensureTicketConversation(updated);
      const conversationHistory = formatConversationForAi(historyMessages);

      const { aiResponse, responseError } = await runResponseGeneration({
        requesterName: updated.name,
        subject: updated.subject,
        message: updated.message,
        analysis,
        status: "resolved",
        conversationHistory,
        assigneeName: updated.assigneeName,
        department: updated.department,
        recommendedAction: updated.recommendedAction,
        closingForResolution: true,
        responseLanguage,
      });

      const nextResponse = aiResponse ?? updated.aiResponse;
      let control: ControlDecision | null = null;
      let controlError: string | null = null;

      updated =
        (await updateTicket(ticketId, {
          status: "resolved",
          ...(aiResponse
            ? {
                aiResponse,
                ...emptyControlFields(),
                responseSent: false,
                responseSentAt: null,
                responseSentMode: null,
              }
            : {}),
        })) ?? updated;

      if (aiResponse) {
        const controlled = await runPersistedControl(ticketId, {
          name: updated.name,
          email: updated.email,
          subject: updated.subject,
          message: updated.message,
          analysis,
          routing: ticketToRouting(updated),
          aiResponse: nextResponse,
        });
        control = controlled.control;
        controlError = controlled.controlError;
        updated = controlled.ticket;
      }

      // Brouillon visible dans la conversation. Une proposition non envoyée
      // est remplacée ; une réponse envoyée reste dans l'historique.
      if (aiResponse) {
        if (existing.responseSent === true) {
          await createTicketMessage({
            ticketId,
            senderType: "ai",
            senderName: "Assistant IA",
            content: aiResponse,
            direction: "outbound",
            deliveryStatus: "draft",
          });
        } else {
          await replaceTicketResponseDraft({
            ticketId,
            previousContent: existing.aiResponse,
            content: aiResponse,
            senderType: "ai",
            senderName: "Assistant IA",
          });
        }
      }

      let autoSent = false;
      let autoSendSkipped = false;

      if (aiResponse && updated) {
        const settings = await getAppSettings();
        if (isAutoSendCustomerResponseAllowed(updated, settings)) {
          const sendResult = await sendCustomerResponse({
            ticketId,
            responseBody: aiResponse,
            mode: "automatic",
            executedBy: "resolve_ticket",
          });
          if (sendResult.ok) {
            updated = sendResult.ticket;
            autoSent = !sendResult.alreadySent;
            if (sendResult.alreadySent) {
              autoSendSkipped = true;
            }
          } else {
            autoSendSkipped = true;
            controlError =
              controlError ??
              sendResult.error ??
              "L'envoi automatique de la réponse de clôture a échoué.";
          }
        } else {
          autoSendSkipped = true;
        }
      }

      return NextResponse.json({
        ticket: updated,
        analysis,
        analysisError: null,
        routing: ticketToRouting(updated),
        routingError: null,
        responseError,
        control,
        controlError,
        autoSent,
        autoSendSkipped,
      });
    }

    // Régénération de la réponse (+ contrôle)
    if (ticketId && mode === "generate_response") {
      const existing = await getTicketById(ticketId);
      if (!existing) {
        return NextResponse.json(
          { error: "Ticket introuvable." },
          { status: 404 },
        );
      }

      const analysis = ticketToAnalysis(existing);
      if (!analysis) {
        return jsonResult({
          ticket: existing,
          analysis: null,
          analysisError: null,
          routing: null,
          routingError: null,
          responseError:
            "L'analyse IA est requise avant de générer une réponse.",
          control: null,
          controlError: null,
        });
      }

      const historyMessages = await ensureTicketConversation(existing);
      const conversationHistory = formatConversationForAi(historyMessages);

      const { aiResponse, responseError } = await runResponseGeneration({
        requesterName: existing.name,
        subject: existing.subject,
        message: existing.message,
        analysis,
        status: requestedStatus ?? existing.status,
        conversationHistory,
        assigneeName: existing.assigneeName,
        department: existing.department,
        recommendedAction: existing.recommendedAction,
        responseLanguage,
      });

      const nextResponse = aiResponse ?? existing.aiResponse;
      let control: ControlDecision | null = null;
      let controlError: string | null = null;
      let updated = await updateTicket(ticketId, {
        ...(aiResponse
          ? {
              aiResponse,
              ...emptyControlFields(),
              // Nouvelle réponse générée : l'envoi précédent ne doit pas bloquer.
              responseSent: false,
              responseSentAt: null,
              responseSentMode: null,
            }
          : {}),
      });

      if (aiResponse) {
        const controlled = await runPersistedControl(ticketId, {
          name: existing.name,
          email: existing.email,
          subject: existing.subject,
          message: existing.message,
          analysis,
          routing: ticketToRouting(existing),
          aiResponse: nextResponse,
        });
        control = controlled.control;
        controlError = controlled.controlError;
        updated = controlled.ticket;
      }

      if (aiResponse && updated) {
        if (existing.responseSent === true) {
          await createTicketMessage({
            ticketId,
            senderType: "ai",
            senderName: "Assistant IA",
            content: aiResponse,
            direction: "outbound",
            deliveryStatus: "draft",
          });
        } else {
          await replaceTicketResponseDraft({
            ticketId,
            previousContent: existing.aiResponse,
            content: aiResponse,
            senderType: "ai",
            senderName: "Assistant IA",
          });
        }
      }

      return jsonResult({
        ticket: updated ?? existing,
        analysis,
        analysisError: null,
        routing: ticketToRouting(existing),
        routingError: null,
        responseError,
        control,
        controlError,
      });
    }

    // Relance du routage (+ contrôle si réponse déjà présente)
    if (ticketId && mode === "route_request") {
      const existing = await getTicketById(ticketId);
      if (!existing) {
        return NextResponse.json(
          { error: "Ticket introuvable." },
          { status: 404 },
        );
      }

      const analysis = ticketToAnalysis(existing);
      if (!analysis) {
        return jsonResult({
          ticket: existing,
          analysis: null,
          analysisError: "L'analyse IA est requise avant le routage.",
          routing: null,
          routingError: "Le routage automatique n'a pas pu être effectué.",
          responseError: null,
          control: null,
          controlError: null,
        });
      }

      const { routing, routingError } = await runRouting({
        message: existing.message,
        subject: existing.subject,
        analysis,
      });

      let control: ControlDecision | null = null;
      let controlError: string | null = null;
      let updated = await updateTicket(ticketId, {
        ...(routing
          ? {
              ...routingToTicketFields(routing),
              ...emptyControlFields(),
            }
          : {}),
      });

      if (routing && existing.aiResponse) {
        const controlled = await runPersistedControl(ticketId, {
          name: existing.name,
          email: existing.email,
          subject: existing.subject,
          message: existing.message,
          analysis,
          routing,
          aiResponse: existing.aiResponse,
        });
        control = controlled.control;
        controlError = controlled.controlError;
        updated = controlled.ticket;
      }

      return jsonResult({
        ticket: updated ?? existing,
        analysis,
        analysisError: null,
        routing,
        routingError,
        responseError: null,
        control,
        controlError,
      });
    }

    // Relance du contrôle seul
    if (ticketId && mode === "control_request") {
      const existing = await getTicketById(ticketId);
      if (!existing) {
        return NextResponse.json(
          { error: "Ticket introuvable." },
          { status: 404 },
        );
      }

      const analysis = ticketToAnalysis(existing);
      if (!analysis) {
        return jsonResult({
          ticket: existing,
          analysis: null,
          analysisError: "L'analyse IA est requise avant le contrôle.",
          routing: ticketToRouting(existing),
          routingError: null,
          responseError: null,
          control: null,
          controlError:
            "Le contrôle automatique n'a pas pu être effectué. Une vérification manuelle est recommandée.",
        });
      }

      const controlled = await runPersistedControl(ticketId, {
        name: existing.name,
        email: existing.email,
        subject: existing.subject,
        message: existing.message,
        analysis,
        routing: ticketToRouting(existing),
        aiResponse: existing.aiResponse,
      });

      return jsonResult({
        ticket: controlled.ticket,
        analysis,
        analysisError: null,
        routing: ticketToRouting(existing),
        routingError: null,
        responseError: null,
        control: controlled.control,
        controlError: controlled.controlError,
      });
    }

    // Relance d'analyse (+ routage + réponse + contrôle)
    if (ticketId) {
      const existing = await getTicketById(ticketId);
      if (!existing) {
        return NextResponse.json(
          { error: "Ticket introuvable." },
          { status: 404 },
        );
      }

      const { analysis, analysisError } = await runAnalysis(existing.message);
      if (!analysis) {
        return jsonResult({
          ticket: existing,
          analysis: null,
          analysisError:
            analysisError ?? "L'analyse IA est temporairement indisponible.",
          routing: null,
          routingError: null,
          responseError: null,
          control: null,
          controlError: null,
        });
      }

      const { routing, routingError } = await runRouting({
        message: existing.message,
        subject: existing.subject,
        analysis,
      });

      const { aiResponse, responseError } = await runResponseGeneration({
        requesterName: existing.name,
        subject: existing.subject,
        message: existing.message,
        analysis,
        status: existing.status,
        responseLanguage,
      });

      let updated = await updateTicket(ticketId, {
        ...analysisToTicketFields(analysis),
        ...(routing ? routingToTicketFields(routing) : emptyRoutingFields()),
        aiResponse,
        ...emptyControlFields(),
      });

      const controlled = await runPersistedControl(ticketId, {
        name: existing.name,
        email: existing.email,
        subject: existing.subject,
        message: existing.message,
        analysis,
        routing,
        aiResponse,
      });
      updated = controlled.ticket;

      return jsonResult({
        ticket: updated ?? existing,
        analysis,
        analysisError: null,
        routing,
        routingError,
        responseError,
        control: controlled.control,
        controlError: controlled.controlError,
      });
    }

    const { name, email, subject, message, errors } =
      validateCreatePayload(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Données invalides.", errors }, {
        status: 400,
      });
    }

    const pipelineStartedAt = Date.now();
    const stageMs: Record<string, number> = {};

    const tAnalysis = Date.now();
    const { analysis, analysisError } = await runAnalysis(message);
    stageMs.analysis_ms = Date.now() - tAnalysis;

    let routing: RoutingDecision | null = null;
    let routingError: string | null = null;
    let aiResponse: string | null = null;
    let responseError: string | null = null;
    let control: ControlDecision | null = null;
    let controlError: string | null = null;

    if (analysis) {
      const t0 = Date.now();
      const routed = await runRouting({ message, subject, analysis });
      stageMs.routing_ms = Date.now() - t0;
      routing = routed.routing;
      routingError = routed.routingError;

      const t1 = Date.now();
      const generated = await runResponseGeneration({
        requesterName: name,
        subject,
        message,
        analysis,
        status: "new",
        assigneeName: routing?.assigneeName ?? null,
        department: routing?.department ?? null,
        recommendedAction: routing?.recommendedAction ?? null,
        responseLanguage,
      });
      stageMs.response_ms = Date.now() - t1;
      aiResponse = generated.aiResponse;
      responseError = generated.responseError;

      const t2 = Date.now();
      const controlled = await runControl({
        name,
        email,
        subject,
        message,
        analysis,
        routing,
        aiResponse,
      });
      stageMs.control_ms = Date.now() - t2;
      control = applyDemoAutomationEligibility(
        controlled.control,
        routing,
      );
      controlError = controlled.controlError;
    }

    let ticket: Ticket;
    try {
      const tDb = Date.now();
      ticket = await createTicket({
        name,
        email,
        subject,
        message,
        status: "new",
        aiResponse,
        isDemo: isDemoMode() ? true : false,
        ...(analysis ? analysisToTicketFields(analysis) : {}),
        ...(routing ? routingToTicketFields(routing) : {}),
        ...(control ? controlToTicketFields(control) : {}),
        controlAttemptVersion: analysis ? 1 : 0,
        controlCompletedVersion: control ? 1 : null,
      });

      await createTicketMessage({
        ticketId: ticket.id,
        senderType: "customer",
        senderName: ticket.name,
        senderEmail: ticket.email,
        content: ticket.message,
        direction: "inbound",
        deliveryStatus: "sent",
      });
      if (ticket.aiResponse?.trim()) {
        await createTicketMessage({
          ticketId: ticket.id,
          senderType: "ai",
          senderName: "Assistant IA",
          content: ticket.aiResponse.trim(),
          direction: "outbound",
          deliveryStatus: "draft",
        });
      }
      stageMs.db_create_ms = Date.now() - tDb;
    } catch (error) {
      const code = error instanceof Error ? error.message : "DB_ERROR";
      console.error("[analyze-request] Neon create failed", {
        code,
        message: error instanceof Error ? error.message : "unknown",
      });
      const dbError = userFacingDbError(code);
      return NextResponse.json(
        { error: dbError.message },
        { status: dbError.status },
      );
    }

    const tTrigger = Date.now();
    const result = await jsonResult({
      ticket,
      analysis,
      analysisError,
      routing,
      routingError,
      responseError,
      control,
      controlError,
    });
    stageMs.trigger_enqueue_ms = Date.now() - tTrigger;
    stageMs.total_ms = Date.now() - pipelineStartedAt;
    console.info("[analyze-request] stage timings", {
      ticketId: ticket.id,
      ...stageMs,
    });
    return result;
  } catch (error) {
    const code = error instanceof Error ? error.message : "DB_ERROR";
    console.error("[analyze-request] unexpected failure", {
      code,
      message: error instanceof Error ? error.message : "unknown",
    });
    const dbError = userFacingDbError(code);
    return NextResponse.json(
      { error: dbError.message },
      { status: dbError.status },
    );
  }
}
