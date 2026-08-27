import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@gd/lib/db/client";
import { assertDemoTicketReadable, assertDemoTicketWritable } from "@gd/lib/demo-guard";
import { getAutomationOutcomeLogs } from "@gd/services/automationLogService";
import { replaceTicketResponseDraft } from "@gd/services/ticketMessageService";
import {
  beginTicketControlAttempt,
  getTicketById,
  updateTicket,
} from "@gd/services/ticketService";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketPriority,
  type TicketStatus,
  type TicketUpdateInput,
} from "@gd/types/ticket";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "La base de données n'est pas configurée. Ajoutez DATABASE_URL côté serveur.",
      },
      { status: 503 },
    );
  }

  const { id } = await context.params;

  const blocked = await assertDemoTicketReadable(id);
  if (blocked) return blocked;

  try {
    const ticket = await getTicketById(id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket introuvable." }, { status: 404 });
    }
    const automationLogs = await getAutomationOutcomeLogs(id);
    const automationLog = automationLogs[automationLogs.length - 1] ?? null;
    return NextResponse.json({ ticket, automationLog, automationLogs });
  } catch (error) {
    console.error("[GET /api/tickets/:id] failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Impossible de charger le ticket. Veuillez réessayer." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "La base de données n'est pas configurée. Ajoutez DATABASE_URL côté serveur.",
      },
      { status: 503 },
    );
  }

  const { id } = await context.params;

  const blocked = await assertDemoTicketWritable(id);
  if (blocked) return blocked;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Le corps de la requête est invalide." },
      { status: 400 },
    );
  }

  const patch: TicketUpdateInput = {};

  if (typeof body.status === "string") {
    if (!(TICKET_STATUSES as string[]).includes(body.status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }
    patch.status = body.status as TicketStatus;
  }

  if (typeof body.priority === "string") {
    if (!(TICKET_PRIORITIES as string[]).includes(body.priority)) {
      return NextResponse.json(
        { error: "Priorité invalide." },
        { status: 400 },
      );
    }
    patch.priority = body.priority as TicketPriority;
  }

  if (typeof body.aiResponse === "string") {
    const trimmed = body.aiResponse.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "La réponse ne peut pas être vide." },
        { status: 400 },
      );
    }
    if (trimmed.length > 12000) {
      return NextResponse.json(
        { error: "La réponse est trop longue." },
        { status: 400 },
      );
    }
    patch.aiResponse = trimmed;
  }

  if (body.aiResponse === null) {
    patch.aiResponse = null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "Aucune modification valide fournie." },
      { status: 400 },
    );
  }

  try {
    const existing = await getTicketById(id);
    if (!existing) {
      return NextResponse.json({ error: "Ticket introuvable." }, { status: 404 });
    }

    if (patch.aiResponse !== undefined) {
      await beginTicketControlAttempt(id);
    }

    const ticket = await updateTicket(id, patch);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket introuvable." }, { status: 404 });
    }

    if (typeof patch.aiResponse === "string" && existing.responseSent !== true) {
      await replaceTicketResponseDraft({
        ticketId: id,
        previousContent: existing.aiResponse,
        content: patch.aiResponse,
        senderType: "human",
        senderName: "Responsable",
      });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("[PATCH /api/tickets/:id] failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Impossible de mettre à jour le ticket. Veuillez réessayer." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  return NextResponse.json(
    {
      error: "DEMO_FORBIDDEN",
      message: "La suppression de demandes est interdite dans la démonstration.",
    },
    { status: 403 },
  );
}
