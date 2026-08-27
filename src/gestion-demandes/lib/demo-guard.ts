import { NextResponse } from "next/server";
import {
  DEMO_FORBIDDEN,
  isDemoMode,
} from "@gd/lib/demo-isolation";
import { getTicketById } from "@gd/services/ticketService";

export function demoForbiddenResponse(message?: string) {
  return NextResponse.json(
    {
      error: DEMO_FORBIDDEN,
      message:
        message ??
        "Cette action n’est pas autorisée dans la démonstration publique.",
    },
    { status: 403 },
  );
}

/** Bloque toute mutation admin en mode démo. */
export function assertDemoAllowsAdminMutation(): NextResponse | null {
  if (!isDemoMode()) return null;
  return demoForbiddenResponse(
    "Les actions administratives sont désactivées dans la démonstration.",
  );
}

/**
 * Lecture publique : uniquement les tickets marqués démo.
 * Les tickets hors démo renvoient 404 (pas de confirmation d’existence).
 */
export async function assertDemoTicketReadable(
  ticketId: string,
): Promise<NextResponse | null> {
  if (!isDemoMode()) return null;
  const ticket = await getTicketById(ticketId);
  if (!ticket || !ticket.isDemo) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return null;
}

/**
 * Autorise la mutation uniquement si le ticket est marqué démo.
 * Les tickets de production restent inaccessibles.
 */
export async function assertDemoTicketWritable(
  ticketId: string,
): Promise<NextResponse | null> {
  if (!isDemoMode()) return null;
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (!ticket.isDemo) {
    return demoForbiddenResponse(
      "Les demandes existantes (hors démo) ne peuvent pas être modifiées.",
    );
  }
  return null;
}
