import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@gd/lib/db/client";
import { assertDemoAllowsAdminMutation } from "@gd/lib/demo-guard";
import { isDemoMode } from "@gd/lib/demo-isolation";
import {
  createTeamMember,
  listAllTeamMembers,
} from "@gd/services/teamMemberService";
import { TICKET_DEPARTMENTS } from "@gd/types/ticket";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // Démo publique : ne jamais exposer la liste réelle des collaborateurs.
  if (isDemoMode()) {
    return NextResponse.json({ members: [] });
  }

  try {
    const members = await listAllTeamMembers();
    return NextResponse.json({ members });
  } catch (error) {
    console.error("[GET /api/team-members] failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Impossible de charger les collaborateurs." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const forbidden = assertDemoAllowsAdminMutation();
  if (forbidden) return forbidden;

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "La base de données n'est pas configurée. Ajoutez DATABASE_URL côté serveur.",
      },
      { status: 503 },
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const department =
    typeof body.department === "string" ? body.department.trim() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Une adresse email valide est requise." },
      { status: 400 },
    );
  }
  if (!department || !(TICKET_DEPARTMENTS as string[]).includes(department)) {
    return NextResponse.json(
      { error: "Le service est invalide." },
      { status: 400 },
    );
  }

  try {
    const member = await createTeamMember({
      name,
      email,
      department,
      role: role || "Collaborateur",
      active: true,
    });
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "Un collaborateur avec cet email existe déjà." },
        { status: 409 },
      );
    }
    console.error("[POST /api/team-members] failed", { message });
    return NextResponse.json(
      { error: "Impossible de créer le collaborateur." },
      { status: 500 },
    );
  }
}
