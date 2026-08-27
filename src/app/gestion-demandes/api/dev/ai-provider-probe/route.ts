import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import {
  generateStructuredJson,
  isGeminiForcedUnavailable,
} from "@gd/services/aiProvider";

export const runtime = "nodejs";

/**
 * Probe serveur (dev uniquement) pour vérifier Gemini / fallback OpenRouter.
 * POST { "mode": "normal" | "force_fallback" | "both_down" }
 *
 * force_fallback s'appuie sur AI_FORCE_GEMINI_UNAVAILABLE=true dans .env.local
 * (ou le body forceFallback: true qui active un override process pour cet appel).
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { mode?: string; forceFallback?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const mode = body.mode || "normal";
  const previousForce = process.env.AI_FORCE_GEMINI_UNAVAILABLE;
  const previousOpenRouter = process.env.OPENROUTER_API_KEY;

  try {
    if (mode === "force_fallback" || body.forceFallback === true) {
      process.env.AI_FORCE_GEMINI_UNAVAILABLE = "true";
    }

    if (mode === "both_down") {
      process.env.AI_FORCE_GEMINI_UNAVAILABLE = "true";
      process.env.OPENROUTER_API_KEY = "";
    }

    const result = await generateStructuredJson({
      operation: "ai-provider-probe",
      systemInstruction:
        'Tu renvoies UNIQUEMENT un JSON {"ok": true, "provider_note": "court"}.',
      userContent: "Réponds avec ok=true.",
      temperature: 0,
      geminiSchema: {
        type: Type.OBJECT,
        properties: {
          ok: { type: Type.BOOLEAN },
          provider_note: { type: Type.STRING },
        },
        required: ["ok", "provider_note"],
      },
      schemaName: "provider_probe",
    });

    return NextResponse.json({
      success: true,
      provider: result.provider,
      fallback: result.fallback,
      fallbackReason: result.fallbackReason ?? null,
      model: result.model,
      forcedGeminiUnavailable: isGeminiForcedUnavailable(),
      textPreview: result.text.slice(0, 200),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "AI_PROVIDER_ERROR",
        forcedGeminiUnavailable: isGeminiForcedUnavailable(),
      },
      { status: 503 },
    );
  } finally {
    if (previousForce === undefined) {
      delete process.env.AI_FORCE_GEMINI_UNAVAILABLE;
    } else {
      process.env.AI_FORCE_GEMINI_UNAVAILABLE = previousForce;
    }
    if (previousOpenRouter === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = previousOpenRouter;
    }
  }
}
