import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import {
  recordAllProvidersUnavailable,
  recordProviderQuotaExceeded,
} from "@gd/services/aiQuotaAlertService";

export type AiProviderName = "gemini" | "openrouter" | "groq";

export type BaseFallbackReason =
  | "rate_limit"
  | "quota"
  | "timeout"
  | "network"
  | "provider_5xx"
  | "provider_configuration"
  | "empty_response"
  | "invalid_json"
  | "forced_unavailable"
  | "gemini_not_configured"
  | "openrouter_not_configured"
  | "groq_not_configured"
  | "temporary_error";

export type FallbackReason =
  | BaseFallbackReason
  | `openrouter_${BaseFallbackReason}`;

export type StructuredJsonResult = {
  text: string;
  provider: AiProviderName;
  fallback: boolean;
  fallbackReason?: FallbackReason;
  model: string;
};

export type GenerateStructuredJsonInput = {
  /** Nom d'opération pour les logs (ex. analyze-request). */
  operation: string;
  systemInstruction: string;
  userContent: string;
  temperature: number;
  /** Schéma Gemini (@google/genai Type.*). */
  geminiSchema: unknown;
  /** Nom du schéma JSON pour OpenRouter. */
  schemaName: string;
  /**
   * Profondeur de réflexion Gemini. « MINIMAL » réduit fortement la latence
   * sur les tâches courtes comme la rédaction d'une réponse client.
   */
  thinkingLevel?: ThinkingLevel;
  /** Modèle Gemini spécifique à l'opération (sinon GEMINI_MODEL). */
  geminiModel?: string;
  /** Modèle OpenRouter spécifique à l'opération (sinon OPENROUTER_MODEL). */
  openRouterModel?: string;
  /**
   * Modèle Groq de dernier recours. Si absent, Groq n'est jamais appelé.
   * La génération de réponse client est la seule opération qui le fournit.
   */
  groqModel?: string;
};

type ClassifiedError = {
  fallbackEligible: boolean;
  reason: BaseFallbackReason;
  status?: number;
  message: string;
};

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

/** Force Gemini indisponible — uniquement hors production. */
export function isGeminiForcedUnavailable(): boolean {
  if (isProductionRuntime()) return false;
  const flag = process.env.AI_FORCE_GEMINI_UNAVAILABLE?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

function isProviderForcedUnavailable(provider: "openrouter" | "groq"): boolean {
  if (isProductionRuntime()) return false;
  const name =
    provider === "openrouter"
      ? "AI_FORCE_OPENROUTER_UNAVAILABLE"
      : "AI_FORCE_GROQ_UNAVAILABLE";
  const flag = process.env[name]?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

function isForcedRateLimit(
  provider: "gemini" | "openrouter" | "groq",
): boolean {
  if (isProductionRuntime()) return false;
  const name = `AI_FORCE_${provider.toUpperCase()}_RATE_LIMIT`;
  const flag = process.env[name]?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

function forcedRateLimitError(provider: AiProviderName): Error {
  const error = new Error(`${provider.toUpperCase()}_FORCED_RATE_LIMIT`) as
    Error & { status: number };
  error.status = 429;
  return error;
}

export function extractJsonObject(content: string): unknown {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("AI_INVALID_JSON");
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function mapGeminiType(typeValue: unknown): string {
  if (typeValue === Type.OBJECT || typeValue === "OBJECT") return "object";
  if (typeValue === Type.ARRAY || typeValue === "ARRAY") return "array";
  if (typeValue === Type.STRING || typeValue === "STRING") return "string";
  if (typeValue === Type.NUMBER || typeValue === "NUMBER") return "number";
  if (typeValue === Type.INTEGER || typeValue === "INTEGER") return "integer";
  if (typeValue === Type.BOOLEAN || typeValue === "BOOLEAN") return "boolean";
  if (typeValue === Type.NULL || typeValue === "NULL") return "null";
  if (typeof typeValue === "string") return typeValue.toLowerCase();
  return "string";
}

/**
 * Convertit un schéma Gemini (Type.*) en JSON Schema utilisable par OpenRouter.
 */
export function geminiSchemaToJsonSchema(
  schema: unknown,
): Record<string, unknown> {
  if (!schema || typeof schema !== "object") {
    return { type: "object", additionalProperties: false };
  }

  const source = schema as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  if (source.type !== undefined) {
    const baseType = mapGeminiType(source.type);
    if (source.nullable === true && baseType !== "null") {
      result.type = [baseType, "null"];
    } else {
      result.type = baseType;
    }
  }

  if (Array.isArray(source.enum)) {
    result.enum = source.enum;
  }

  if (source.items) {
    result.items = geminiSchemaToJsonSchema(source.items);
  }

  if (source.properties && typeof source.properties === "object") {
    const props: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      source.properties as Record<string, unknown>,
    )) {
      props[key] = geminiSchemaToJsonSchema(value);
    }
    result.properties = props;
  }

  if (Array.isArray(source.required)) {
    result.required = source.required;
  }

  if (result.type === "object" || (Array.isArray(result.type) && result.type.includes("object"))) {
    result.additionalProperties = false;
  }

  return result;
}

function classifyError(error: unknown): ClassifiedError {
  if (error instanceof Error && error.message === "GEMINI_FORCED_UNAVAILABLE") {
    return {
      fallbackEligible: true,
      reason: "forced_unavailable",
      message: error.message,
    };
  }

  const err = error as {
    name?: string;
    message?: string;
    status?: number | string;
    statusCode?: number;
    code?: string | number;
    error?: { code?: number | string; status?: string; message?: string };
    cause?: unknown;
  };

  const statusRaw = err?.status ?? err?.statusCode ?? err?.error?.code;
  const status =
    typeof statusRaw === "number"
      ? statusRaw
      : typeof statusRaw === "string" && /^\d+$/.test(statusRaw)
        ? Number(statusRaw)
        : undefined;

  const message = [
    err?.message,
    err?.error?.message,
    err?.error?.status,
    typeof err?.code === "string" ? err.code : "",
  ]
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();

  if (status === 429 || message.includes("resource_exhausted") || message.includes("rate limit") || message.includes("rate_limit")) {
    return {
      fallbackEligible: true,
      reason: message.includes("quota") ? "quota" : "rate_limit",
      status,
      message: err?.message || "rate_limit",
    };
  }

  if (message.includes("quota") || message.includes("billing")) {
    return {
      fallbackEligible: true,
      reason: "quota",
      status,
      message: err?.message || "quota",
    };
  }

  if (
    status === 401 ||
    status === 403 ||
    message.includes("api key") ||
    message.includes("authentication") ||
    message.includes("unauthorized") ||
    message.includes("invalid model") ||
    message.includes("model not found")
  ) {
    return {
      fallbackEligible: true,
      reason: "provider_configuration",
      status,
      message: err?.message || "provider_configuration",
    };
  }

  if (
    message.includes("timeout") ||
    message.includes("etimedout") ||
    message.includes("deadline")
  ) {
    return {
      fallbackEligible: true,
      reason: "timeout",
      status,
      message: err?.message || "timeout",
    };
  }

  if (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("econnreset") ||
    message.includes("enotfound") ||
    message.includes("socket") ||
    err?.name === "TypeError"
  ) {
    return {
      fallbackEligible: true,
      reason: "network",
      status,
      message: err?.message || "network",
    };
  }

  if (status !== undefined && status >= 500 && status <= 599) {
    return {
      fallbackEligible: true,
      reason: "provider_5xx",
      status,
      message: err?.message || `http_${status}`,
    };
  }

  if (
    message.includes("unavailable") ||
    message.includes("temporarily") ||
    message.includes("overloaded") ||
    status === 408
  ) {
    return {
      fallbackEligible: true,
      reason: "temporary_error",
      status,
      message: err?.message || "temporary_error",
    };
  }

  return {
    fallbackEligible: false,
    reason: "temporary_error",
    status,
    message: err?.message || "unknown_error",
  };
}

function getGeminiClient(modelOverride?: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const model =
    modelOverride?.trim() ||
    process.env.GEMINI_MODEL?.trim() ||
    "gemini-3.5-flash";
  return {
    ai: new GoogleGenAI({ apiKey }),
    model,
  };
}

function getOpenRouterConfig(modelOverride?: string) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    model:
      modelOverride?.trim() ||
      process.env.OPENROUTER_MODEL?.trim() ||
      "openrouter/free",
    appUrl: process.env.APP_URL?.trim() || "http://localhost:3000",
  };
}

function getGroqConfig(modelOverride?: string) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  const model = modelOverride?.trim();
  if (!apiKey || !model) return null;

  return { apiKey, model };
}

async function callGemini(
  input: GenerateStructuredJsonInput,
): Promise<{ text: string; model: string }> {
  if (isForcedRateLimit("gemini")) {
    throw forcedRateLimitError("gemini");
  }
  if (isGeminiForcedUnavailable()) {
    throw new Error("GEMINI_FORCED_UNAVAILABLE");
  }

  const client = getGeminiClient(input.geminiModel);
  if (!client) {
    throw new Error("GEMINI_NOT_CONFIGURED");
  }

  const { ai, model } = client;
  const softTimeoutMs = Math.max(
    2000,
    Number(process.env.AI_GEMINI_SOFT_TIMEOUT_MS?.trim() || "8000") || 8000,
  );

  async function generate(withThinkingLevel: boolean) {
    const response = await ai.models.generateContent({
      model,
      contents: input.userContent,
      config: {
        systemInstruction: input.systemInstruction,
        temperature: input.temperature,
        responseMimeType: "application/json",
        responseSchema: input.geminiSchema as never,
        ...(withThinkingLevel && input.thinkingLevel
          ? { thinkingConfig: { thinkingLevel: input.thinkingLevel } }
          : {}),
      },
    });

    const text = response.text?.trim() ?? "";
    if (!text) {
      throw new Error("AI_EMPTY_RESPONSE");
    }

    // Vérifie que le JSON est parseable avant d'accepter Gemini.
    extractJsonObject(text);

    return { text, model };
  }

  async function generateWithSoftTimeout(withThinkingLevel: boolean) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        generate(withThinkingLevel),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            reject(
              new Error(`Gemini soft timeout after ${softTimeoutMs}ms`),
            );
          }, softTimeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  try {
    return await generateWithSoftTimeout(true);
  } catch (error) {
    // Un modèle qui refuse thinkingConfig ne doit pas déclencher un fallback.
    if (
      input.thinkingLevel &&
      error instanceof Error &&
      error.message.toLowerCase().includes("thinking")
    ) {
      console.warn(`[${input.operation}] thinkingLevel refusé, nouvel essai`, {
        model,
      });
      return generateWithSoftTimeout(false);
    }

    if (
      error instanceof Error &&
      (error.message === "AI_EMPTY_RESPONSE" ||
        error.message === "AI_INVALID_JSON" ||
        error.message === "GEMINI_FORCED_UNAVAILABLE")
    ) {
      throw error;
    }

    const err = error as {
      name?: string;
      message?: string;
      status?: number | string;
      statusCode?: number;
      code?: string | number;
      error?: { code?: number | string; status?: string; message?: string };
      cause?: unknown;
    };

    console.error(`[${input.operation}] Gemini call failed`, {
      model,
      hasApiKey: true,
      errorName: err?.name,
      errorMessage: err?.message,
      status: err?.status ?? err?.statusCode ?? err?.error?.code,
      statusText: err?.error?.status,
      code: err?.code,
      nestedMessage: err?.error?.message,
      cause:
        err?.cause instanceof Error
          ? { name: err.cause.name, message: err.cause.message }
          : undefined,
    });

    throw error;
  }
}

async function callOpenRouter(
  input: GenerateStructuredJsonInput,
): Promise<{ text: string; model: string }> {
  if (isForcedRateLimit("openrouter")) {
    throw forcedRateLimitError("openrouter");
  }
  if (isProviderForcedUnavailable("openrouter")) {
    throw new Error("OPENROUTER_FORCED_UNAVAILABLE");
  }

  const config = getOpenRouterConfig(input.openRouterModel);
  if (!config) {
    throw new Error("OPENROUTER_NOT_CONFIGURED");
  }

  const jsonSchema = geminiSchemaToJsonSchema(input.geminiSchema);

  const body = {
    model: config.model,
    temperature: input.temperature,
    messages: [
      { role: "system", content: input.systemInstruction },
      { role: "user", content: input.userContent },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: input.schemaName,
        strict: true,
        schema: jsonSchema,
      },
    },
    provider: {
      require_parameters: true,
    },
  };

  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": config.appUrl,
        "X-Title": "Assistant IA",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error(`[${input.operation}] OpenRouter network error`, {
      model: config.model,
      hasApiKey: true,
      errorMessage: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }

  const rawText = await response.text();
  let payload: {
    error?: { message?: string; code?: number | string };
    model?: string;
    choices?: Array<{ message?: { content?: string | null } }>;
  } = {};

  try {
    payload = JSON.parse(rawText) as typeof payload;
  } catch {
    // conserve rawText pour le log
  }

  if (!response.ok) {
    const message =
      payload.error?.message || rawText.slice(0, 300) || `HTTP ${response.status}`;
    console.error(`[${input.operation}] OpenRouter call failed`, {
      model: config.model,
      hasApiKey: true,
      status: response.status,
      errorMessage: message,
    });
    const err = new Error(message) as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  const content = payload.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) {
    throw new Error("AI_EMPTY_RESPONSE");
  }

  extractJsonObject(content);

  return {
    text: content,
    model: payload.model || config.model,
  };
}

async function callGroq(
  input: GenerateStructuredJsonInput,
): Promise<{ text: string; model: string }> {
  if (isForcedRateLimit("groq")) {
    throw forcedRateLimitError("groq");
  }
  if (isProviderForcedUnavailable("groq")) {
    throw new Error("GROQ_FORCED_UNAVAILABLE");
  }

  const config = getGroqConfig(input.groqModel);
  if (!config) {
    throw new Error("GROQ_NOT_CONFIGURED");
  }

  const jsonSchema = geminiSchemaToJsonSchema(input.geminiSchema);
  const body = {
    model: config.model,
    temperature: input.temperature,
    messages: [
      { role: "system", content: input.systemInstruction },
      { role: "user", content: input.userContent },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: input.schemaName,
        strict: true,
        schema: jsonSchema,
      },
    },
  };

  let response: Response;
  try {
    response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
  } catch (error) {
    console.error(`[${input.operation}] Groq network error`, {
      model: config.model,
      hasApiKey: true,
      errorMessage: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }

  const rawText = await response.text();
  let payload: {
    error?: { message?: string; code?: number | string };
    model?: string;
    choices?: Array<{ message?: { content?: string | null } }>;
  } = {};

  try {
    payload = JSON.parse(rawText) as typeof payload;
  } catch {
    // rawText est uniquement utilisé de façon tronquée en cas d'erreur.
  }

  if (!response.ok) {
    const message =
      payload.error?.message ||
      rawText.slice(0, 300) ||
      `HTTP ${response.status}`;
    console.error(`[${input.operation}] Groq call failed`, {
      model: config.model,
      hasApiKey: true,
      status: response.status,
      errorMessage: message,
    });
    const err = new Error(message) as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  const content = payload.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) {
    throw new Error("AI_EMPTY_RESPONSE");
  }

  // Même validation JSON que Gemini et OpenRouter.
  extractJsonObject(content);

  return {
    text: content,
    model: payload.model || config.model,
  };
}

function fallbackDetails(error: unknown): {
  eligible: boolean;
  reason: BaseFallbackReason;
  status?: number;
} {
  if (error instanceof Error) {
    if (
      error.message === "GEMINI_FORCED_UNAVAILABLE" ||
      error.message === "OPENROUTER_FORCED_UNAVAILABLE" ||
      error.message === "GROQ_FORCED_UNAVAILABLE"
    ) {
      return { eligible: true, reason: "forced_unavailable" };
    }
    if (error.message === "GEMINI_NOT_CONFIGURED") {
      return { eligible: true, reason: "gemini_not_configured" };
    }
    if (error.message === "OPENROUTER_NOT_CONFIGURED") {
      return { eligible: true, reason: "openrouter_not_configured" };
    }
    if (error.message === "GROQ_NOT_CONFIGURED") {
      return { eligible: true, reason: "groq_not_configured" };
    }
    if (error.message === "AI_EMPTY_RESPONSE") {
      return { eligible: true, reason: "empty_response" };
    }
    if (error.message === "AI_INVALID_JSON") {
      return { eligible: true, reason: "invalid_json" };
    }
  }

  const classified = classifyError(error);
  return {
    eligible: classified.fallbackEligible,
    reason: classified.reason,
    status: classified.status,
  };
}

/**
 * Gemini → OpenRouter → Groq, strictement en série.
 * Groq n'est activé que si input.groqModel est fourni.
 */
export async function generateStructuredJson(
  input: GenerateStructuredJsonInput,
): Promise<StructuredJsonResult> {
  const requestStartedAt = Date.now();
  const openRouterConfigured = Boolean(
    getOpenRouterConfig(input.openRouterModel),
  );
  const geminiClient = getGeminiClient(input.geminiModel);
  const openRouterConfig = getOpenRouterConfig(input.openRouterModel);
  const groqConfig = getGroqConfig(input.groqModel);
  const geminiConfigured = Boolean(geminiClient);
  const groqConfigured = Boolean(groqConfig);

  if (!geminiConfigured && !openRouterConfigured && !groqConfigured) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  let geminiReason: BaseFallbackReason = "gemini_not_configured";
  let geminiRateLimited = false;

  if (geminiConfigured) {
    const geminiStartedAt = Date.now();
    try {
      const gemini = await callGemini(input);
      console.info(`[AI] operation=${input.operation} provider=gemini`, {
        model: gemini.model,
        status: 200,
        duration_ms: Date.now() - geminiStartedAt,
        total_duration_ms: Date.now() - requestStartedAt,
        fallback: false,
        fallbackReason: null,
      });
      return {
        text: gemini.text,
        provider: "gemini",
        fallback: false,
        model: gemini.model,
      };
    } catch (error) {
      const details = fallbackDetails(error);
      if (!details.eligible) {
        throw new Error("AI_PROVIDER_ERROR");
      }
      geminiReason = details.reason;
      geminiRateLimited = details.status === 429;
      if (geminiRateLimited) {
        recordProviderQuotaExceeded({
          provider: "gemini",
          model:
            geminiClient?.model ??
            input.geminiModel ??
            process.env.GEMINI_MODEL?.trim() ??
            "gemini-3.5-flash",
          fallbackTarget: openRouterConfigured
            ? "openrouter"
            : groqConfigured
              ? "groq"
              : null,
        });
      }
      console.warn(
        `[${input.operation}] Gemini unavailable → fallback OpenRouter`,
        {
          gemini_duration_ms: Date.now() - geminiStartedAt,
          status: details.status,
          fallback: true,
          fallback_reason: geminiReason,
        },
      );
    }
  }

  let openRouterReason: BaseFallbackReason = "openrouter_not_configured";
  let openRouterRateLimited = false;

  if (openRouterConfigured) {
    const openRouterStartedAt = Date.now();
    try {
      const openrouter = await callOpenRouter(input);
      console.info(`[AI] operation=${input.operation} provider=openrouter`, {
        model: openrouter.model,
        status: 200,
        duration_ms: Date.now() - openRouterStartedAt,
        total_duration_ms: Date.now() - requestStartedAt,
        fallback: true,
        fallbackReason: geminiReason,
        fallback_reason: geminiReason,
      });
      return {
        text: openrouter.text,
        provider: "openrouter",
        fallback: true,
        fallbackReason: geminiReason,
        model: openrouter.model,
      };
    } catch (error) {
      const details = fallbackDetails(error);
      if (!details.eligible) {
        throw new Error("AI_PROVIDER_ERROR");
      }
      openRouterReason = details.reason;
      openRouterRateLimited = details.status === 429;
      if (openRouterRateLimited) {
        recordProviderQuotaExceeded({
          provider: "openrouter",
          model:
            openRouterConfig?.model ??
            input.openRouterModel ??
            process.env.OPENROUTER_MODEL?.trim() ??
            "openrouter/free",
          fallbackTarget: groqConfigured ? "groq" : null,
        });
      }
      console.warn(
        `[${input.operation}] OpenRouter unavailable → fallback Groq`,
        {
          openrouter_duration_ms: Date.now() - openRouterStartedAt,
          status: details.status,
          fallback: true,
          fallback_reason: openRouterReason,
        },
      );
    }
  }

  if (!groqConfigured) {
    console.error(`[${input.operation}] providers unavailable`, {
      gemini_reason: geminiReason,
      openrouter_reason: openRouterReason,
      groq_configured: false,
    });
    throw new Error("AI_PROVIDER_ERROR");
  }

  const groqStartedAt = Date.now();
  try {
    const groq = await callGroq(input);
    const fallbackReason =
      `openrouter_${openRouterReason}` as FallbackReason;
    console.info(`[AI] operation=${input.operation} provider=groq`, {
      model: groq.model,
      status: 200,
      duration_ms: Date.now() - groqStartedAt,
      total_duration_ms: Date.now() - requestStartedAt,
      fallback: true,
      fallbackReason,
      fallback_reason: fallbackReason,
    });
    return {
      text: groq.text,
      provider: "groq",
      fallback: true,
      fallbackReason,
      model: groq.model,
    };
  } catch (error) {
    const details = fallbackDetails(error);
    const groqRateLimited = details.status === 429;
    if (groqRateLimited) {
      recordProviderQuotaExceeded({
        provider: "groq",
        model:
          groqConfig?.model ??
          input.groqModel ??
          process.env.GROQ_RESPONSE_MODEL?.trim() ??
          "openai/gpt-oss-20b",
        fallbackTarget: null,
      });
    }
    if (geminiRateLimited && openRouterRateLimited && groqRateLimited) {
      recordAllProvidersUnavailable({
        modelSummary: [
          geminiClient?.model ?? "Gemini",
          openRouterConfig?.model ?? "OpenRouter",
          groqConfig?.model ?? "Groq",
        ].join(" → "),
      });
    }
    console.error(`[${input.operation}] Groq fallback failed`, {
      provider: "groq",
      model: groqConfig?.model ?? input.groqModel,
      status: details.status,
      fallback: false,
      fallbackReason: details.reason,
      fallback_reason: details.reason,
      duration_ms: Date.now() - groqStartedAt,
      errorMessage: error instanceof Error ? error.message : "unknown",
    });
    throw new Error("AI_PROVIDER_ERROR");
  }
}
