import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@gd/lib/db/client";
import { assertDemoAllowsAdminMutation } from "@gd/lib/demo-guard";
import {
  getAppSettings,
  updateAppSettings,
} from "@gd/services/appSettingsService";

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
    const settings = await getAppSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[GET /api/settings] failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Impossible de charger les paramètres." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
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

  const patch: {
    controlScoreThreshold?: number;
    autoSendResponses?: boolean;
  } = {};

  if (body.controlScoreThreshold !== undefined) {
    const num = Number(body.controlScoreThreshold);
    if (!Number.isFinite(num) || num < 0 || num > 100) {
      return NextResponse.json(
        { error: "Le seuil doit être un nombre entre 0 et 100." },
        { status: 400 },
      );
    }
    patch.controlScoreThreshold = num;
  }

  if (body.autoSendResponses !== undefined) {
    if (typeof body.autoSendResponses !== "boolean") {
      return NextResponse.json(
        { error: "Le mode d'envoi automatique est invalide." },
        { status: 400 },
      );
    }
    patch.autoSendResponses = body.autoSendResponses;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "Aucune modification valide fournie." },
      { status: 400 },
    );
  }

  try {
    const settings = await updateAppSettings(patch);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[PATCH /api/settings] failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Impossible d'enregistrer les paramètres." },
      { status: 500 },
    );
  }
}
