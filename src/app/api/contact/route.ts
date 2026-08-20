import { Resend } from "resend";
import { getClientIp, checkRateLimit } from "@/lib/contact/rate-limit";
import { validateContactPayload } from "@/lib/contact/validation";

export const runtime = "nodejs";

const GENERIC_ERROR =
  "Impossible d’envoyer le message pour le moment. Réessayez plus tard.";

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
  if (!limit.allowed) {
    return json(
      {
        ok: false,
        error: GENERIC_ERROR,
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
        error: GENERIC_ERROR,
        ...(debug ? { code: "validation_error" as DiagnosticCode } : {}),
      },
      400,
    );
  }

  const parsed = validateContactPayload(body);
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
        error: "Vérifiez les champs du formulaire.",
        errors: parsed.errors,
        ...(debug ? { code: "validation_error" as DiagnosticCode } : {}),
      },
      400,
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim();
  const fromName =
    process.env.CONTACT_FROM_NAME?.trim() || "Portfolio Alexis Romney";

  const missing: string[] = [];
  if (!apiKey) missing.push("RESEND_API_KEY");
  if (!toEmail) missing.push("CONTACT_TO_EMAIL");
  if (!fromEmail) missing.push("CONTACT_FROM_EMAIL");

  if (missing.length > 0) {
    console.error("[contact] Missing env:", missing.join(", "));
    return json(
      {
        ok: false,
        error: GENERIC_ERROR,
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

  // Narrowed after missing-env guard
  const resolvedApiKey = apiKey as string;
  const resolvedToEmail = toEmail as string;
  const resolvedFromEmail = fromEmail as string;

  const { name, email, subject, message } = parsed.data;
  const safeSubject = subject.slice(0, 120);
  const html = `
    <div style="font-family:Georgia,serif;line-height:1.5;color:#111">
      <p><strong>Nouveau message depuis le portfolio</strong></p>
      <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
      <p><strong>Email :</strong> ${escapeHtml(email)}</p>
      <p><strong>Sujet :</strong> ${escapeHtml(safeSubject)}</p>
      <p><strong>Message :</strong></p>
      <pre style="white-space:pre-wrap;font-family:ui-monospace,monospace">${escapeHtml(message)}</pre>
    </div>
  `;

  try {
    const resend = new Resend(resolvedApiKey);
    const result = await resend.emails.send({
      from: `${fromName} <${resolvedFromEmail}>`,
      to: [resolvedToEmail],
      replyTo: email,
      subject: `[Portfolio] ${safeSubject}`,
      html,
      text: `Nom: ${name}\nEmail: ${email}\nSujet: ${safeSubject}\n\n${message}`,
    });

    if (result.error) {
      const resendMessage = redactResendMessage(
        result.error.message || "unknown_resend_error",
      );
      console.error("[contact] Resend error:", resendMessage);
      return json(
        {
          ok: false,
          error: GENERIC_ERROR,
          ...(debug
            ? {
                code: "resend_error" as DiagnosticCode,
                resendMessage,
                fromDomain: resolvedFromEmail.includes("@")
                  ? resolvedFromEmail.split("@")[1]
                  : null,
                toDomain: resolvedToEmail.includes("@")
                  ? resolvedToEmail.split("@")[1]
                  : null,
                hint:
                  "Si le domaine d’envoi n’est pas vérifié dans Resend, utilisez CONTACT_FROM_EMAIL=onboarding@resend.dev en local. Le destinataire (to) doit être l’email du compte Resend tant qu’aucun domaine n’est vérifié.",
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
          error: GENERIC_ERROR,
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

    console.info("[contact] Resend accepted email id:", id);
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
              toDomain: resolvedToEmail.includes("@")
                ? resolvedToEmail.split("@")[1]
                : null,
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
        error: GENERIC_ERROR,
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
