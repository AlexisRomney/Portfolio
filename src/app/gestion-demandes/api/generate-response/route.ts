import { NextResponse } from "next/server";
import { assertDemoTicketReadable } from "@gd/lib/demo-guard";
import { isDemoMode } from "@gd/lib/demo-isolation";
import { enforceRateLimit } from "@gd/lib/rateLimit";
import { generateCustomerResponse } from "@gd/services/aiService";
import { getTicketById } from "@gd/services/ticketService";
import {
  TICKET_STATUSES,
  type Ticket,
  type TicketStatus,
} from "@gd/types/ticket";

export const runtime = "nodejs";

type ConversationItem = {
  senderType?: unknown;
  senderName?: unknown;
  content?: unknown;
};

/** Seuls les derniers échanges sont utiles : le prompt reste court. */
const MAX_HISTORY_MESSAGES = 8;
const MAX_MESSAGE_CHARS = 1500;

function conversationForAi(value: unknown): string | undefined {
  if (!Array.isArray(value)) return undefined;

  const lines = value
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => {
      const message = item as ConversationItem;
      if (typeof message.content !== "string") return null;
      const content = message.content.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!content) return null;
      const sender =
        typeof message.senderName === "string" && message.senderName.trim()
          ? message.senderName.trim()
          : message.senderType === "customer"
            ? "Demandeur"
            : message.senderType === "ai"
              ? "Assistant IA"
              : "Agent";
      return `${sender} : ${content}`;
    })
    .filter((line): line is string => line !== null);

  return lines.length > 0 ? lines.join("\n\n") : undefined;
}

export async function POST(request: Request) {
  const limit = enforceRateLimit(request, "generate-response", 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "Trop de générations en peu de temps. Réessayez dans quelques instants.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Le corps de la requête est invalide." },
      { status: 400 },
    );
  }

  const ticketId =
    typeof body.ticketId === "string"
      ? body.ticketId.trim()
      : typeof (body.ticket as { id?: unknown } | undefined)?.id === "string"
        ? String((body.ticket as { id: string }).id).trim()
        : "";

  // En démo : exiger un ticket démo persisté ; ne jamais faire confiance au body seul.
  if (isDemoMode()) {
    if (!ticketId) {
      return NextResponse.json(
        {
          error: "DEMO_FORBIDDEN",
          message:
            "Un identifiant de demande de démonstration est requis.",
        },
        { status: 403 },
      );
    }
    const blocked = await assertDemoTicketReadable(ticketId);
    if (blocked) return blocked;
  }

  let ticket: Partial<Ticket>;
  if (ticketId) {
    const persisted = await getTicketById(ticketId);
    if (!persisted) {
      return NextResponse.json({ error: "Ticket introuvable." }, { status: 404 });
    }
    ticket = persisted;
  } else {
    ticket = (body.ticket as Partial<Ticket> | undefined) ?? {};
  }

  const responseLanguage = body.locale === "en" ? "en" : "fr";
  if (
    typeof ticket.name !== "string" ||
    typeof ticket.subject !== "string" ||
    typeof ticket.message !== "string" ||
    typeof ticket.status !== "string" ||
    !(TICKET_STATUSES as string[]).includes(ticket.status)
  ) {
    return NextResponse.json(
      { error: "L'état actuel de la demande est invalide." },
      { status: 400 },
    );
  }

  const startedAt = Date.now();
  console.info("[AI RESPONSE] generation started", {
    ticketId: ticket.id,
    status: ticket.status,
  });

  try {
    const aiResponse = await generateCustomerResponse({
      requesterName: ticket.name,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status as TicketStatus,
      conversationHistory: conversationForAi(body.conversation),
      analysis: {
        ...(ticket.category ? { category: ticket.category } : {}),
        ...(ticket.subcategory ? { subcategory: ticket.subcategory } : {}),
        ...(ticket.priority ? { priority: ticket.priority } : {}),
        ...(ticket.sentiment ? { sentiment: ticket.sentiment } : {}),
        ...(ticket.summary ? { summary: ticket.summary } : {}),
        ...(ticket.action ? { action: ticket.action } : {}),
        usefulInformation: ticket.usefulInformation ?? [],
      },
      assigneeName: ticket.assigneeName,
      department: ticket.department,
      recommendedAction: ticket.recommendedAction,
      closingForResolution: ticket.status === "resolved",
      responseLanguage,
    });

    console.info("[AI RESPONSE] generation completed", {
      duration_ms: Date.now() - startedAt,
      ai_calls: 1,
    });
    return NextResponse.json({ aiResponse });
  } catch (error) {
    console.error("[AI RESPONSE] generation failed", {
      duration_ms: Date.now() - startedAt,
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "La réponse IA n'a pas pu être générée. Réessayez." },
      { status: 502 },
    );
  }
}
