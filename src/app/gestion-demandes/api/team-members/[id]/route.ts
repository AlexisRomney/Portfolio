import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@gd/lib/db/client";
import { assertDemoAllowsAdminMutation } from "@gd/lib/demo-guard";
import {
  getTeamMemberById,
  updateTeamMember,
} from "@gd/services/teamMemberService";
import { TICKET_DEPARTMENTS } from "@gd/types/ticket";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
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

  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Le corps de la requête est invalide." },
      { status: 400 },
    );
  }

  const existing = await getTeamMemberById(id);
  if (!existing) {
    return NextResponse.json(
      { error: "Collaborateur introuvable." },
      { status: 404 },
    );
  }

  const patch: {
    name?: string;
    email?: string;
    department?: string;
    role?: string;
    active?: boolean;
  } = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
    }
    patch.name = name;
  }

  if (typeof body.email === "string") {
    const email = body.email.trim();
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Une adresse email valide est requise." },
        { status: 400 },
      );
    }
    patch.email = email;
  }

  if (typeof body.department === "string") {
    const department = body.department.trim();
    if (!(TICKET_DEPARTMENTS as string[]).includes(department)) {
      return NextResponse.json(
        { error: "Le service est invalide." },
        { status: 400 },
      );
    }
    patch.department = department;
  }

  if (typeof body.role === "string") {
    patch.role = body.role.trim() || "Collaborateur";
  }

  if (typeof body.active === "boolean") {
    patch.active = body.active;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "Aucune modification valide fournie." },
      { status: 400 },
    );
  }

  try {
    const member = await updateTeamMember(id, patch);
    if (!member) {
      return NextResponse.json(
        { error: "Collaborateur introuvable." },
        { status: 404 },
      );
    }
    return NextResponse.json({ member });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "Un collaborateur avec cet email existe déjà." },
        { status: 409 },
      );
    }
    console.error("[PATCH /api/team-members/:id] failed", { message });
    return NextResponse.json(
      { error: "Impossible de mettre à jour le collaborateur." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const forbidden = assertDemoAllowsAdminMutation();
  if (forbidden) return forbidden;

  return NextResponse.json(
    { error: "La suppression de collaborateurs n’est pas disponible." },
    { status: 405 },
  );
}
