import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@gd/lib/db/client";
import { assertDemoTicketWritable } from "@gd/lib/demo-guard";
import { enforceRateLimit } from "@gd/lib/rateLimit";
import { sendCustomerResponse } from "@gd/services/customerResponseService";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "La base de données n'est pas configurée. Ajoutez DATABASE_URL côté serveur.",
      },
      { status: 503 },
    );
  }

  const limit = enforceRateLimit(request, "send-response", 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Trop d'envois en peu de temps. Réessayez dans quelques instants." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
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

  const responseText =
    typeof body.response === "string" ? body.response : "";
  const sendKey =
    typeof body.sendKey === "string" ? body.sendKey.trim() : undefined;

  const result = await sendCustomerResponse({
    ticketId: id,
    responseBody: responseText,
    mode: "manual",
    executedBy: "user",
    sendKey,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, ticket: result.ticket },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ticket: result.ticket,
    alreadySent: result.alreadySent === true,
  });
}
