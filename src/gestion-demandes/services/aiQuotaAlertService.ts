import {
  sendAiAlertEmail,
  type AiAlertEmailInput,
} from "@gd/services/emailService";
import type { AiProviderName } from "@gd/services/aiProvider";

const COOLDOWN_MS = 60 * 60 * 1000;
const MAX_EVENTS = 200;

type AlertEvent = {
  provider: AiProviderName | "all";
  model: string;
  status: 429;
  occurredAt: string;
  action: string;
  critical: boolean;
  emailQueued: boolean;
};

type AlertSender = (
  input: AiAlertEmailInput,
) => ReturnType<typeof sendAiAlertEmail>;

type AlertState = {
  cooldownUntil: Map<string, number>;
  events: AlertEvent[];
  testSender?: AlertSender;
};

const globalAlertState = globalThis as typeof globalThis & {
  __assistantAiAlertState?: AlertState;
};

const state: AlertState =
  globalAlertState.__assistantAiAlertState ??
  {
    cooldownUntil: new Map<string, number>(),
    events: [],
  };

globalAlertState.__assistantAiAlertState = state;

function providerLabel(provider: AiProviderName): string {
  if (provider === "openrouter") return "OpenRouter";
  if (provider === "groq") return "Groq";
  return "Gemini";
}

function reserveCooldown(key: string, now: number): boolean {
  const until = state.cooldownUntil.get(key) ?? 0;
  if (until > now) return false;
  state.cooldownUntil.set(key, now + COOLDOWN_MS);
  return true;
}

function recordEvent(event: AlertEvent): void {
  state.events.push(event);
  if (state.events.length > MAX_EVENTS) {
    state.events.splice(0, state.events.length - MAX_EVENTS);
  }
}

function queueEmail(input: AiAlertEmailInput): void {
  const sender = state.testSender ?? sendAiAlertEmail;
  void sender(input)
    .then((result) => {
      console.info("[AI ALERT]", {
        status: result.ok ? "sent" : "failed",
        type: input.idempotencyKey.startsWith("ai-alert:critical")
          ? "critical"
          : "quota",
      });
    })
    .catch(() => {
      console.warn("[AI ALERT]", {
        status: "failed",
        type: "quota",
      });
    });
}

/**
 * Enregistre un 429 et réserve au plus une alerte par fournisseur / heure.
 * L'envoi est fire-and-forget : Resend ne retarde ni ne bloque le fallback.
 */
export function recordProviderQuotaExceeded(input: {
  provider: AiProviderName;
  model: string;
  fallbackTarget: AiProviderName | null;
  now?: number;
}): AlertEvent {
  const now = input.now ?? Date.now();
  const occurredAt = new Date(now).toISOString();
  const label = providerLabel(input.provider);
  const action = input.fallbackTarget
    ? `Fallback automatique vers ${providerLabel(input.fallbackTarget)}`
    : "Aucun fournisseur de secours disponible";
  const recipient = process.env.AI_ALERT_EMAIL?.trim();
  const emailQueued = Boolean(
    recipient && reserveCooldown(`quota:${input.provider}`, now),
  );

  const event: AlertEvent = {
    provider: input.provider,
    model: input.model,
    status: 429,
    occurredAt,
    action,
    critical: false,
    emailQueued,
  };
  recordEvent(event);

  console.warn("[AI QUOTA]", {
    provider: input.provider,
    model: input.model,
    status: 429,
    fallback: input.fallbackTarget !== null,
    fallbackReason: "rate_limit",
    occurredAt,
    alertEmailQueued: emailQueued,
  });

  if (recipient && emailQueued) {
    queueEmail({
      to: recipient,
      subject: `⚠️ Assistant IA : quota ${label} dépassé`,
      body: [
        `Fournisseur :`,
        label,
        "",
        "Modèle :",
        input.model,
        "",
        "Erreur :",
        "HTTP 429",
        "",
        "Date :",
        occurredAt,
        "",
        "Action :",
        action,
      ].join("\n"),
      idempotencyKey: `ai-alert:quota:${input.provider}:${Math.floor(
        now / COOLDOWN_MS,
      )}`,
    });
  }

  return event;
}

/** Alerte critique distincte, elle aussi limitée à une par heure. */
export function recordAllProvidersUnavailable(input: {
  modelSummary: string;
  now?: number;
}): AlertEvent {
  const now = input.now ?? Date.now();
  const occurredAt = new Date(now).toISOString();
  const recipient = process.env.AI_ALERT_EMAIL?.trim();
  const emailQueued = Boolean(
    recipient && reserveCooldown("critical:all", now),
  );
  const event: AlertEvent = {
    provider: "all",
    model: input.modelSummary,
    status: 429,
    occurredAt,
    action: "Vérifier les quotas Gemini, OpenRouter et Groq",
    critical: true,
    emailQueued,
  };
  recordEvent(event);

  console.error("[AI QUOTA]", {
    provider: "all",
    model: input.modelSummary,
    status: 429,
    fallback: false,
    fallbackReason: "all_providers_rate_limited",
    occurredAt,
    alertEmailQueued: emailQueued,
  });

  if (recipient && emailQueued) {
    queueEmail({
      to: recipient,
      subject: "🚨 Assistant IA : tous les fournisseurs indisponibles",
      body: [
        "Fournisseurs :",
        "Gemini, OpenRouter et Groq",
        "",
        "Modèles :",
        input.modelSummary,
        "",
        "Erreur :",
        "HTTP 429 pour les trois fournisseurs",
        "",
        "Date :",
        occurredAt,
        "",
        "Action :",
        event.action,
      ].join("\n"),
      idempotencyKey: `ai-alert:critical:all:${Math.floor(
        now / COOLDOWN_MS,
      )}`,
    });
  }

  return event;
}

/** Utilitaires réservés aux scripts de test locaux. */
export function resetAiQuotaAlertsForTests(): void {
  state.cooldownUntil.clear();
  state.events.length = 0;
  delete state.testSender;
}

export function setAiAlertSenderForTests(sender?: AlertSender): void {
  state.testSender = sender;
}

export function getAiQuotaEventsForTests(): readonly AlertEvent[] {
  return [...state.events];
}
