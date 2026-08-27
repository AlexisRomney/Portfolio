import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@gd/lib/db/client";
import { assertDemoTicketReadable, assertDemoTicketWritable } from "@gd/lib/demo-guard";
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
} from "@gd/services/ticketMessageService";
import {
  beginTicketControlAttempt,
  completeTicketControlAttempt,
  getTicketById,
  updateTicket,
} from "@gd/services/ticketService";
import { triggerProcessTicketIfEligible } from "@gd/services/triggerProcessTicket";
import type { TicketUpdateInput } from "@gd/types/ticket";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "La base de données n'est pas configurée." },
      { status: 503 },
    );
  }

  const { id } = await context.params;

  const blocked = await assertDemoTicketReadable(id);
  if (blocked) return blocked;

  const ticket = await getTicketById(id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket introuvable." }, { status: 404 });
  }

  try {
    const messages = await ensureTicketConversation(ticket);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[GET /api/tickets/:id/messages] failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Impossible de charger la conversation." },
      { status: 500 },
    );
  }
}

/**
 * Nouveau message client dans une conversation existante.
 * Analyse le nouveau contenu, met à jour le ticket, régénère une réponse.
 * Ne recrée pas un ticket.
 */
export async function POST(request: Request, context: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "La base de données n'est pas configurée." },
      { status: 503 },
    );
  }

  const limit = enforceRateLimit(request, "followup", 8, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "Trop de messages en peu de temps. Réessayez dans quelques instants.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const { id } = await context.params;

  const blocked = await assertDemoTicketWritable(id);
  if (blocked) return blocked;

  const ticket = await getTicketById(id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket introuvable." }, { status: 404 });
  }

  let body: { content?: unknown; senderType?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Le corps de la requête est invalide." },
      { status: 400 },
    );
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json(
      { error: "Le message ne peut pas être vide." },
      { status: 400 },
    );
  }
  if (content.length > 8000) {
    return NextResponse.json(
      { error: "Le message est trop long." },
      { status: 400 },
    );
  }

  const senderType =
    body.senderType === "human" ? ("human" as const) : ("customer" as const);

  try {
    await ensureTicketConversation(ticket);

    const customerMessage = await createTicketMessage({
      ticketId: id,
      senderType,
      senderName: senderType === "human" ? "Agent" : ticket.name,
      senderEmail: senderType === "human" ? null : ticket.email,
      content,
      direction: senderType === "human" ? "outbound" : "inbound",
      deliveryStatus: senderType === "human" ? "draft" : "sent",
    });

    // Réponse humaine : pas de pipeline IA.
    if (senderType === "human") {
      await beginTicketControlAttempt(id);
      const updated = await updateTicket(id, {
        aiResponse: content,
        status: ticket.status === "new" ? "in_progress" : ticket.status,
        responseSent: false,
        responseSentAt: null,
        responseSentMode: null,
      });
      const messages = await ensureTicketConversation(updated ?? ticket);
      return NextResponse.json({
        ticket: updated ?? ticket,
        messages,
        message: customerMessage,
      });
    }

    const prior = await ensureTicketConversation(ticket);
    const history = formatConversationForAi(prior);
    const controlAttempt = await beginTicketControlAttempt(id);
    if (!controlAttempt) {
      return NextResponse.json({ error: "Ticket introuvable." }, { status: 404 });
    }

    let analysisError: string | null = null;
    let routingError: string | null = null;
    let responseError: string | null = null;
    let controlError: string | null = null;

    let analysis = null;
    try {
      analysis = await analyzeRequestMessage(content, {
        conversationHistory: history,
      });
    } catch (error) {
      analysisError =
        error instanceof Error ? error.message : "AI_PROVIDER_ERROR";
    }

    const patch: TicketUpdateInput = {
      message: content,
      status: ticket.status === "resolved" ? "in_progress" : ticket.status,
      responseSent: false,
      responseSentAt: null,
      responseSentMode: null,
      processedBy: null,
      processedAt: null,
      automationStatus: null,
    };

    if (analysis) {
      patch.category = analysis.category;
      patch.subcategory = analysis.subcategory;
      patch.priority = analysis.priority;
      patch.sentiment = analysis.sentiment;
      patch.summary = analysis.summary;
      patch.action = analysis.action;
      patch.usefulInformation = analysis.usefulInformation;
    }

    const shouldReroute =
      Boolean(analysis) &&
      (analysis!.category !== ticket.category ||
        analysis!.priority === "high" ||
        !ticket.assigneeId);

    if (analysis && shouldReroute) {
      try {
        const routing = await routeRequest({
          message: content,
          subject: ticket.subject,
          analysis,
        });
        patch.department = routing.department;
        patch.assigneeType = routing.assigneeType;
        patch.assigneeId = routing.assigneeId;
        patch.assigneeName = routing.assigneeName;
        patch.routingReason = routing.routingReason;
        patch.recommendedAction = routing.recommendedAction;
        patch.escalation = routing.escalation;
        patch.escalationReason = routing.escalationReason;
      } catch {
        routingError = "Le routage n'a pas pu être mis à jour.";
      }
    }

    let aiResponse: string | null = null;
    if (analysis) {
      try {
        const mid = await updateTicket(id, patch);
        const current = mid ?? ticket;
        const thread = await ensureTicketConversation(current);
        aiResponse = await generateCustomerResponse({
          requesterName: current.name,
          subject: current.subject,
          message: content,
          analysis,
          status: current.status,
          conversationHistory: formatConversationForAi(thread),
          assigneeName: current.assigneeName ?? patch.assigneeName,
          department: current.department ?? patch.department,
          recommendedAction:
            current.recommendedAction ?? patch.recommendedAction,
        });
        patch.aiResponse = aiResponse;
      } catch {
        responseError = "La réponse IA n'a pas pu être générée.";
      }
    }

    if (analysis && aiResponse) {
      try {
        const mid = await getTicketById(id);
        const routingForControl =
          mid && mid.department && mid.assigneeType && mid.routingReason
            ? {
                department: mid.department,
                assigneeType: mid.assigneeType,
                assigneeId: mid.assigneeId,
                assigneeName: mid.assigneeName,
                routingReason: mid.routingReason,
                recommendedAction: mid.recommendedAction ?? "",
                escalation: mid.escalation ?? false,
                escalationReason: mid.escalationReason,
              }
            : null;

        const controlRaw = await controlRequest({
          name: ticket.name,
          email: ticket.email,
          subject: ticket.subject,
          message: content,
          analysis,
          routing: routingForControl,
          aiResponse,
        });
        const control = applyDemoAutomationEligibility(
          controlRaw,
          routingForControl,
        );
        if (!control) {
          controlError = "Le contrôle IA n'a pas pu être effectué.";
        } else {
          const completed = await completeTicketControlAttempt(
            id,
            controlAttempt.controlAttemptVersion,
            {
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
            },
          );
          if (!completed) {
            controlError =
              "Ce contrôle a été remplacé par une tentative plus récente.";
          }
        }
      } catch {
        controlError = "Le contrôle IA n'a pas pu être effectué.";
      }
    }

    const updated = await updateTicket(id, patch);

    if (aiResponse) {
      await createTicketMessage({
        ticketId: id,
        senderType: "ai",
        senderName: "Assistant IA",
        content: aiResponse,
        direction: "outbound",
        deliveryStatus: "draft",
      });
    }

    const finalTicket = updated ?? (await getTicketById(id)) ?? ticket;
    if (finalTicket) {
      await triggerProcessTicketIfEligible(finalTicket);
    }

    const messages = await ensureTicketConversation(finalTicket);

    return NextResponse.json({
      ticket: finalTicket,
      messages,
      message: customerMessage,
      analysisError,
      routingError,
      responseError,
      controlError,
    });
  } catch (error) {
    console.error("[POST /api/tickets/:id/messages] failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Impossible d'enregistrer le message." },
      { status: 500 },
    );
  }
}
