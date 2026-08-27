"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@gd/components/ui/Button";
import { Field, TextArea, TextInput } from "@gd/components/ui/Field";
import {
  hasFormErrors,
  validateTicketForm,
  type TicketFormErrors,
} from "@gd/lib/request-validation";
import { useTickets } from "@gd/lib/tickets-store";
import { submitTicketForAnalysis } from "@gd/services/analyzeRequestClient";
import { useI18n } from "@gd/i18n";

type SubmitPhase = "idle" | "submitting" | "done";

export function RequestForm() {
  const router = useRouter();
  const { upsertTicket } = useTickets();
  const { locale, t, translateApiText } = useI18n();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<TicketFormErrors>({});
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "warning">("success");

  const isSubmitting = phase === "submitting";

  function clearFieldError(field: keyof TicketFormErrors) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const values = { name, email, subject, message };
    const validationErrors = validateTicketForm(values);
    const nextErrors: TicketFormErrors = {
      name: validationErrors.name ? t("form.nameRequired") : undefined,
      email: validationErrors.email
        ? validationErrors.email.includes("valide")
          ? t("form.emailInvalid")
          : t("form.emailRequired")
        : undefined,
      subject: validationErrors.subject ? t("form.subjectRequired") : undefined,
      message: validationErrors.message ? t("form.messageRequired") : undefined,
    };
    setErrors(nextErrors);

    if (hasFormErrors(nextErrors)) {
      return;
    }

    setPhase("submitting");
    setStatusTone("success");
    setStatusMessage(t("form.analyzing"));

    const result = await submitTicketForAnalysis(values, locale);

    if (!result.ok) {
      if (result.errors) {
        setErrors({
          name: result.errors.name,
          email: result.errors.email,
          subject: result.errors.subject,
          message: result.errors.message,
        });
      }
      setStatusTone("warning");
      setStatusMessage(translateApiText(result.error));
      setPhase("idle");
      return;
    }

    upsertTicket(result.ticket);

    if (result.analysisError) {
      setStatusTone("warning");
      setStatusMessage(
        `${t("form.receivedAnalysisUnavailable")} ${translateApiText(result.analysisError)}`,
      );
    } else if (result.controlError) {
      setStatusTone("warning");
      setStatusMessage(
        `${t("form.processed")} ${translateApiText(result.controlError)}`,
      );
    } else if (result.routingError && result.responseError) {
      setStatusTone("warning");
      setStatusMessage(
        t("form.partialAi"),
      );
    } else if (result.routingError) {
      setStatusTone("warning");
      setStatusMessage(
        `${t("form.analyzed")} ${translateApiText(result.routingError)}`,
      );
    } else if (result.responseError) {
      setStatusTone("warning");
      setStatusMessage(`${t("form.analyzedRouted")} ${translateApiText(result.responseError)}`);
    } else if (result.ticket.controlApproved === false) {
      setStatusTone("warning");
      setStatusMessage(
        t("form.humanReview"),
      );
    } else {
      setStatusTone("success");
      setStatusMessage(
        t("form.success"),
      );
    }

    setPhase("done");

    window.setTimeout(() => {
      router.push(`/gestion-demandes/demandes/${result.ticket.id}`);
    }, 900);
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit} noValidate>
      {statusMessage ? (
        <div
          className={`alert ${statusTone === "success" ? "alert-success" : "alert-warning"}`}
          role="status"
        >
          {isSubmitting ? (
            <span className="analyzing-status">
              <span className="analyzing-spinner" aria-hidden />
              {statusMessage}
            </span>
          ) : (
            statusMessage
          )}
        </div>
      ) : null}

      <div className="form-grid form-grid-simple">
        <Field label={t("form.name")} htmlFor="name" error={errors.name}>
          <TextInput
            id="name"
            name="name"
            autoComplete="name"
            value={name}
            disabled={isSubmitting || phase === "done"}
            invalid={Boolean(errors.name)}
            onChange={(event) => {
              setName(event.target.value);
              clearFieldError("name");
            }}
            placeholder="Jean Dupont"
          />
        </Field>

        <Field
          label={t("common.email")}
          htmlFor="email"
          error={errors.email}
          hint={t("form.emailDemoHint")}
        >
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={isSubmitting || phase === "done"}
            invalid={Boolean(errors.email)}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            placeholder="jean@example.com"
          />
        </Field>

        <Field label={t("form.subject")} htmlFor="subject" error={errors.subject}>
          <TextInput
            id="subject"
            name="subject"
            value={subject}
            disabled={isSubmitting || phase === "done"}
            invalid={Boolean(errors.subject)}
            onChange={(event) => {
              setSubject(event.target.value);
              clearFieldError("subject");
            }}
            placeholder={t("form.subjectPlaceholder")}
          />
        </Field>

        <Field label={t("form.message")} htmlFor="message" error={errors.message}>
          <TextArea
            id="message"
            name="message"
            rows={8}
            value={message}
            disabled={isSubmitting || phase === "done"}
            invalid={Boolean(errors.message)}
            onChange={(event) => {
              setMessage(event.target.value);
              clearFieldError("message");
            }}
            placeholder={t("form.messagePlaceholder")}
          />
        </Field>
      </div>

      <div className="form-actions">
        <Button type="submit" disabled={isSubmitting || phase === "done"}>
          {isSubmitting ? t("form.sending") : t("form.send")}
        </Button>
      </div>
    </form>
  );
}
