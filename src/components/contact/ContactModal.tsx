"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import {
  CONTACT_LIMITS,
  type ContactFieldErrors,
} from "@/lib/contact/validation";
import { easeOut } from "@/lib/motion";
import { cn } from "@/lib/cn";

type Status = "idle" | "submitting" | "success" | "error";

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
};

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website_url: "",
};

export function ContactModal({ open, onClose }: ContactModalProps) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const reset = useCallback(() => {
    setForm(initialForm);
    setErrors({});
    setStatus("idle");
    setServerError("");
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(reset, 300);
      return () => window.clearTimeout(t);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, reset]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrors({});
    setServerError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        errors?: ContactFieldErrors;
        code?: string;
        missing?: string[];
        resendId?: string;
        resendMessage?: string;
        hint?: string;
        note?: string;
      } | null;

      if (process.env.NODE_ENV !== "production") {
        console.info("[contact form] API response", {
          status: response.status,
          code: data?.code,
          missing: data?.missing,
          resendId: data?.resendId,
          resendMessage: data?.resendMessage,
          hint: data?.hint,
          note: data?.note,
        });
      }

      if (!response.ok || !data?.ok) {
        if (data?.errors) setErrors(data.errors);
        const detail =
          process.env.NODE_ENV !== "production" && data?.code
            ? ` (${data.code}${data.missing?.length ? `: ${data.missing.join(", ")}` : ""}${data.resendMessage ? ` — ${data.resendMessage}` : ""})`
            : "";
        setServerError(
          (data?.error || "Impossible d’envoyer le message.") + detail,
        );
        setStatus("error");
        return;
      }

      if (process.env.NODE_ENV !== "production" && data.code === "honeypot") {
        setServerError(
          "Diagnostic: honeypot déclenché (aucun email envoyé). Videz le champ caché / désactivez l’autofill.",
        );
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setServerError("Impossible d’envoyer le message.");
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
        >
          <button
            type="button"
            aria-label="Fermer la fenêtre de contact"
            className="absolute inset-0 bg-[color-mix(in_oklab,var(--ink)_72%,transparent)] backdrop-blur-md"
            onClick={handleClose}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="relative z-10 flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/12 bg-[var(--surface)] shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:rounded-3xl"
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
              <div>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--accent)]">
                  Contact
                </p>
                <h2
                  id={titleId}
                  className="mt-1 font-display text-2xl tracking-tight text-[var(--paper)]"
                >
                  Me contacter
                </h2>
                <p id={descId} className="mt-1 text-sm text-[var(--muted)]">
                  Décrivez brièvement votre besoin — réponse directe par e-mail.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={handleClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 text-[var(--paper)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                aria-label="Fermer"
              >
                <span aria-hidden className="text-lg leading-none">
                  ×
                </span>
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              {status === "success" ? (
                <div className="space-y-4 py-6 text-center">
                  <p className="font-display text-2xl text-[var(--paper)]">
                    Message envoyé
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    Merci. Je reviens vers vous dès que possible.
                  </p>
                  <Button type="button" onClick={handleClose}>
                    Fermer
                  </Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={onSubmit} noValidate>
                  <Field
                    label="Nom"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    maxLength={CONTACT_LIMITS.name.max}
                    error={errors.name}
                    disabled={status === "submitting"}
                    onChange={(value) => setForm((f) => ({ ...f, name: value }))}
                  />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    maxLength={CONTACT_LIMITS.email.max}
                    error={errors.email}
                    disabled={status === "submitting"}
                    onChange={(value) =>
                      setForm((f) => ({ ...f, email: value }))
                    }
                  />
                  <Field
                    label="Sujet"
                    name="subject"
                    value={form.subject}
                    maxLength={CONTACT_LIMITS.subject.max}
                    error={errors.subject}
                    disabled={status === "submitting"}
                    onChange={(value) =>
                      setForm((f) => ({ ...f, subject: value }))
                    }
                  />
                  <Field
                    label="Message"
                    name="message"
                    as="textarea"
                    value={form.message}
                    maxLength={CONTACT_LIMITS.message.max}
                    error={errors.message}
                    disabled={status === "submitting"}
                    onChange={(value) =>
                      setForm((f) => ({ ...f, message: value }))
                    }
                  />

                  {/* Honeypot — obscure name to avoid browser autofill */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
                  >
                    <label htmlFor="website_url">Website</label>
                    <input
                      id="website_url"
                      name="website_url"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website_url}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, website_url: e.target.value }))
                      }
                    />
                  </div>

                  {status === "error" && serverError ? (
                    <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
                      {serverError}
                    </p>
                  ) : null}

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleClose}
                      disabled={status === "submitting"}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={status === "submitting"}>
                      {status === "submitting"
                        ? "Envoi en cours…"
                        : "Envoyer le message"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  disabled,
  maxLength,
  type = "text",
  autoComplete,
  as = "input",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  maxLength: number;
  type?: string;
  autoComplete?: string;
  as?: "input" | "textarea";
}) {
  const id = useId();
  const shared =
    "w-full rounded-xl border border-white/12 bg-[var(--ink)] px-3 py-3 text-sm text-[var(--paper)] outline-none transition-[border-color] placeholder:text-[var(--steel)] focus:border-[var(--accent)] disabled:opacity-60";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-[var(--muted)]">
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          rows={5}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(shared, "resize-y min-h-28")}
          aria-invalid={Boolean(error)}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={shared}
          aria-invalid={Boolean(error)}
        />
      )}
      {error ? (
        <p className="mt-1.5 text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
