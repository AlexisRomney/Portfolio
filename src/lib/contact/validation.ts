export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { min: 5, max: 120 },
  subject: { min: 3, max: 120 },
  message: { min: 20, max: 4000 },
} as const;

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  /**
   * Honeypot — must stay empty.
   * Avoid names like "company" (browser autofill can fill them and
   * silently "succeed" without sending mail).
   */
  website_url?: string;
};

export type ContactFieldErrors = Partial<
  Record<"name" | "email" | "subject" | "message", string>
>;

export function sanitizeText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").normalize("NFKC").trim().slice(0, max);
}

export function validateContactPayload(input: unknown): {
  ok: true;
  data: Required<Omit<ContactPayload, "website_url">> & { website_url: string };
} | {
  ok: false;
  errors: ContactFieldErrors;
  honeypot?: boolean;
} {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      errors: { message: "Données invalides." },
    };
  }

  const raw = input as Record<string, unknown>;
  // Accept legacy "company" honeypot key too
  const honeypotValue =
    sanitizeText(raw.website_url, 120) || sanitizeText(raw.company, 120);
  if (honeypotValue) {
    return { ok: false, errors: {}, honeypot: true };
  }

  const name = sanitizeText(raw.name, CONTACT_LIMITS.name.max);
  const email = sanitizeText(raw.email, CONTACT_LIMITS.email.max).toLowerCase();
  const subject = sanitizeText(raw.subject, CONTACT_LIMITS.subject.max);
  const message = sanitizeText(raw.message, CONTACT_LIMITS.message.max);

  const errors: ContactFieldErrors = {};

  if (name.length < CONTACT_LIMITS.name.min) {
    errors.name = "Indiquez votre nom.";
  }
  if (!EMAIL_RE.test(email) || email.length < CONTACT_LIMITS.email.min) {
    errors.email = "Adresse e-mail invalide.";
  }
  if (subject.length < CONTACT_LIMITS.subject.min) {
    errors.subject = "Indiquez un sujet.";
  }
  if (message.length < CONTACT_LIMITS.message.min) {
    errors.message = "Message trop court.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: { name, email, subject, message, website_url: "" },
  };
}
