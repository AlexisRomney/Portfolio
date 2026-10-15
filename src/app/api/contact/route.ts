import { Resend } from "resend";
import { getClientIp, checkRateLimit } from "@/lib/contact/rate-limit";
import { isLocale, type Locale } from "@/i18n/config";
import { getPortfolioDictionary } from "@/i18n/portfolio-dictionary";
import { validateContactPayload } from "@/lib/contact/validation";

export const runtime = "nodejs";

/**
 * Destinataire unique des messages du formulaire.
 * Toujours cette adresse — jamais l’e-mail saisi par le visiteur.
 * (serveur uniquement ; ne pas exposer côté client)
 */
const CONTACT_INBOX = "Alexis.romney@hotmail.fr";

function localeFromRequest(request: Request, body?: unknown): Locale {
  if (body && typeof body === "object" && "locale" in body) {
    const raw = String((body as Record<string, unknown>).locale);
    if (isLocale(raw)) return raw;
  }
  const accept = request.headers.get("accept-language") ?? "";
  if (/\ben(-|;|,|$)/i.test(accept)) return "en";
  return "fr";
}

function apiError(locale: Locale): string {
  return getPortfolioDictionary(locale).contactApi.genericError;
}

/** Diagnostic codes for local debugging — never include secrets. */
type DiagnosticCode =
  | "validation_error"
  | "honeypot"
  | "rate_limited"
  | "missing_env"
  | "resend_error"
  | "network_error"
  | "accepted";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isDevDiagnosticEnabled() {
  return process.env.NODE_ENV !== "production";
}

function json(
  body: Record<string, unknown>,
  status: number,
  headers?: HeadersInit,
) {
  return Response.json(body, { status, headers });
}

function redactResendMessage(message: string): string {
  // Never echo API keys if Resend ever includes them
  return message.replace(/re_[A-Za-z0-9_]+/g, "[redacted]");
}

export async function POST(request: Request) {
  const debug = isDevDiagnosticEnabled();
  const ip = getClientIp(request);
  const limit = checkRateLimit(`contact:${ip}`);
  const fallbackLocale = localeFromRequest(request);
  if (!limit.allowed) {
    return json(
      {
        ok: false,
        error: apiError(fallbackLocale),
        ...(debug ? { code: "rate_limited" as DiagnosticCode } : {}),
      },
      429,
      limit.retryAfterSec
        ? { "Retry-After": String(limit.retryAfterSec) }
        : undefined,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: apiError(fallbackLocale),
        ...(debug ? { code: "validation_error" as DiagnosticCode } : {}),
      },
      400,
    );
  }

  const locale = localeFromRequest(request, body);
  const validationMessages = getPortfolioDictionary(locale).contact.validation;

  const parsed = validateContactPayload(body, validationMessages);
  if (!parsed.ok) {
    if (parsed.honeypot) {
      // Silent success for bots
      return json(
        {
          ok: true,
          ...(debug ? { code: "honeypot" as DiagnosticCode } : {}),
        },
        200,
      );
    }
    return json(
      {
        ok: false,
        error: validationMessages.formCheck,
        errors: parsed.errors,
        ...(debug ? { code: "validation_error" as DiagnosticCode } : {}),
      },
      400,
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim();
  const fromName =
    process.env.CONTACT_FROM_NAME?.trim() || "Portfolio Alexis Romney";

  const missing: string[] = [];
  if (!apiKey) missing.push("RESEND_API_KEY");
  if (!fromEmail) missing.push("CONTACT_FROM_EMAIL");

  if (missing.length > 0) {
    console.error("[contact] Missing env:", missing.join(", "));
    return json(
      {
        ok: false,
        error: apiError(locale),
        ...(debug
          ? {
              code: "missing_env" as DiagnosticCode,
              missing,
              hint: "Créez `.env.local` (pas `.env.example`) puis redémarrez `npm run dev`.",
            }
          : {}),
      },
      503,
    );
  }

  const resolvedApiKey = apiKey as string;
  const resolvedFromEmail = fromEmail as string;
  const { name, email: visitorEmail, subject, message } = parsed.data;

  // Garde-fou explicite : le visiteur n’est jamais le destinataire.
  const to = CONTACT_INBOX;
  const replyTo = visitorEmail;

  const safeSubject = subject.slice(0, 120);
  const text = [
    "Nouveau message depuis le portfolio",
    "",
    `Nom du contact : ${name}`,
    `Adresse e-mail : ${visitorEmail}`,
    `Sujet : ${safeSubject}`,
    "",
    "Message :",
    message,
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;line-height:1.5;color:#111">
      <p><strong>Nouveau message depuis le portfolio</strong></p>
      <p><strong>Nom du contact :</strong> ${escapeHtml(name)}</p>
      <p><strong>Adresse e-mail :</strong> ${escapeHtml(visitorEmail)}</p>
      <p><strong>Sujet :</strong> ${escapeHtml(safeSubject)}</p>
      <p><strong>Message :</strong></p>
      <pre style="white-space:pre-wrap;font-family:ui-monospace,monospace">${escapeHtml(message)}</pre>
    </div>
  `;

  try {
    const resend = new Resend(resolvedApiKey);
    const result = await resend.emails.send({
      from: `${fromName} <${resolvedFromEmail}>`,
      to: [to],
      replyTo,
      subject: `[Portfolio] ${safeSubject}`,
      html,
      text,
    });

    if (result.error) {
      const resendMessage = redactResendMessage(
        result.error.message || "unknown_resend_error",
      );
      console.error("[contact] Resend error:", resendMessage);
      return json(
        {
          ok: false,
          error: apiError(locale),
          ...(debug
            ? {
                code: "resend_error" as DiagnosticCode,
                resendMessage,
                fromDomain: resolvedFromEmail.includes("@")
                  ? resolvedFromEmail.split("@")[1]
                  : null,
                toDomain: to.includes("@") ? to.split("@")[1] : null,
                hint:
                  "Si le domaine d’envoi n’est pas vérifié dans Resend, utilisez CONTACT_FROM_EMAIL=onboarding@resend.dev en local. Avec onboarding@resend.dev, le destinataire doit souvent être l’email du compte Resend.",
              }
            : {}),
        },
        502,
      );
    }

    const id = result.data?.id ?? null;
    if (!id) {
      console.error("[contact] Resend accepted response without id");
      return json(
        {
          ok: false,
          error: apiError(locale),
          ...(debug
            ? {
                code: "resend_error" as DiagnosticCode,
                resendMessage: "missing_email_id",
              }
            : {}),
        },
        502,
      );
    }

    console.info("[contact] Resend accepted email id:", id, {
      to,
      replyTo,
      from: resolvedFromEmail,
    });
    return json(
      {
        ok: true,
        ...(debug
          ? {
              code: "accepted" as DiagnosticCode,
              resendId: id,
              fromDomain: resolvedFromEmail.includes("@")
                ? resolvedFromEmail.split("@")[1]
                : null,
              toDomain: to.includes("@") ? to.split("@")[1] : null,
              note: "Accepté par Resend (id reçu). Vérifiez le dashboard Resend puis boîte + spam — ce n’est pas une preuve de livraison.",
            }
          : {}),
      },
      200,
    );
  } catch (err) {
    const messageText =
      err instanceof Error ? redactResendMessage(err.message) : "unknown";
    console.error("[contact] Unexpected send failure:", messageText);
    return json(
      {
        ok: false,
        error: apiError(locale),
        ...(debug
          ? {
              code: "network_error" as DiagnosticCode,
              resendMessage: messageText,
            }
          : {}),
      },
      500,
    );
  }
}
