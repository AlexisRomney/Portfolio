import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@gd/lib/db/client";
import { isDemoMode } from "@gd/lib/demo-isolation";
import { getDemoTickets, getTickets } from "@gd/services/ticketService";

export const runtime = "nodejs";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "La base de données n'est pas configurée. Ajoutez DATABASE_URL côté serveur.",
      },
      { status: 503 },
    );
  }

  try {
    // Démo publique : filtre SQL is_demo = true (jamais SELECT * non filtré).
    const tickets = isDemoMode() ? await getDemoTickets() : await getTickets();
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("[GET /api/tickets] failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Impossible de charger les tickets. Veuillez réessayer." },
      { status: 500 },
    );
  }
}
