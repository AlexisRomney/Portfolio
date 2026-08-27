"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@gd/components/ui/Button";
import { formatDateTime } from "@gd/lib/labels";
import {
  clearTicketLocalOverrideField,
  getTicketLocalOverride,
} from "@gd/lib/ticket-local-overrides";
import {
  patchTicketLocalConversation,
  readTicketLocalConversation,
} from "@gd/lib/ticket-local-conversation";
import { useTickets } from "@gd/lib/tickets-store";
import { generateCurrentTicketResponse } from "@gd/services/analyzeRequestClient";
import { applyDemoMessagesLocale } from "@gd/data/demo-ticket-locales";
import type { Ticket } from "@gd/types/ticket";
import type { TicketMessage } from "@gd/types/ticketMessage";
import { useI18n } from "@gd/i18n";

type Props = {
  ticket: Ticket;
};

export function ConversationPanel({ ticket }: Props) {
  const { upsertTicket } = useTickets();
  const { locale, t, translateApiText } = useI18n();
  const [serverMessages, setServerMessages] = useState<TicketMessage[]>([]);
  const [localConversation, setLocalConversation] = useState(() =>
    readTicketLocalConversation(ticket.id),
  );
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  /** Proposition IA en attente d'envoi : locale ou brouillon serveur. */
  const serverDraftProposal = useMemo(
    () =>
      [...serverMessages]
        .reverse()
        .find(
          (message) =>
            message.direction === "outbound" &&
            (message.deliveryStatus === "draft" ||
              message.deliveryStatus === "sending") &&
            (message.senderType === "ai" || message.senderType === "human"),
        ) ?? null,
    [serverMessages],
  );

  const proposal =
    localConversation.proposal !== undefined
      ? localConversation.proposal
      : (serverDraftProposal?.content ?? "");

  const [syncedProposal, setSyncedProposal] = useState(proposal);
  const [draft, setDraft] = useState(
    localConversation.draft || proposal || "",
  );

  const messages = useMemo(() => {
    const byId = new Map<string, TicketMessage>();
    for (const message of serverMessages) {
      byId.set(message.id, message);
    }
    for (const message of localConversation.messages) {
      // Les messages locaux (follow-up démo) complètent l'historique serveur.
      if (!byId.has(message.id)) {
        byId.set(message.id, message);
      }
    }
    const ordered = [...byId.values()].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return applyDemoMessagesLocale(ordered, locale);
  }, [localConversation.messages, locale, serverMessages]);

  // Synchronisation en rendu : une nouvelle proposition remplit la même zone.
  if (proposal !== syncedProposal) {
    setSyncedProposal(proposal);
    setDraft(proposal);
  }

  const refreshMessages = useCallback(async () => {
    try {
      const response = await fetch(`/gestion-demandes/api/tickets/${ticket.id}/messages`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        messages?: TicketMessage[];
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ? translateApiText(data.error) : translateApiText("Impossible de charger la conversation."));
        return;
      }
      setServerMessages(data.messages ?? []);
    } catch {
      setError(translateApiText("Impossible de charger la conversation."));
    } finally {
      setLoading(false);
    }
  }, [ticket.id, translateApiText]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/gestion-demandes/api/tickets/${ticket.id}/messages`, {
          cache: "no-store",
        });
        const data = (await response.json()) as {
          messages?: TicketMessage[];
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok) {
          setError(data.error ? translateApiText(data.error) : translateApiText("Impossible de charger la conversation."));
          return;
        }
        setServerMessages(data.messages ?? []);
      } catch {
        if (!cancelled) {
          setError(translateApiText("Impossible de charger la conversation."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [ticket.id, translateApiText]);

  const isProposalMode =
    Boolean(localConversation.proposalCreatedAt) ||
    (localConversation.proposal === undefined &&
      Boolean(serverDraftProposal));
  const busy = isGenerating || isSending;
  const needsHuman =
    ticket.requiresHumanReview === true || ticket.controlApproved === false;

  /** Fil de conversation : uniquement les messages envoyés (+ follow-ups locaux). */
  const threadMessages = messages.filter((message) => {
    if (message.deliveryStatus === "draft") return false;
    if (message.deliveryStatus === "sending") return false;
    return true;
  });

  async function generateResponse() {
    if (busy) return;

    const hadResponse = isProposalMode;
    setIsGenerating(true);
    setError(null);
    setInfo(
      ticket.status === "resolved"
        ? t("conversation.generatingClosing")
        : t("conversation.generatingResponse"),
    );

    const pendingCustomer =
      !isProposalMode && draft.trim()
        ? [
            {
              id: `draft-${ticket.id}`,
              ticketId: ticket.id,
              senderType: "customer" as const,
              senderName: ticket.name,
              senderEmail: ticket.email,
              content: draft.trim(),
              direction: "inbound" as const,
              deliveryStatus: "sent" as const,
              sendKey: null,
              sentAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
          ]
        : [];

    const currentConversation = [...threadMessages, ...pendingCustomer];
    const result = await generateCurrentTicketResponse(
      ticket,
      currentConversation,
      locale,
    );
    if (!result.ok) {
      setError(translateApiText(result.error));
      setInfo(null);
      setIsGenerating(false);
      return;
    }

    const now = new Date().toISOString();
    const sendKey = crypto.randomUUID();
    let nextMessages = localConversation.messages;
    if (pendingCustomer[0]) {
      nextMessages = [...localConversation.messages, pendingCustomer[0]];
    }

    const nextLocal = patchTicketLocalConversation(ticket.id, {
      messages: nextMessages,
      proposal: result.aiResponse,
      proposalCreatedAt: now,
      proposalSendKey: sendKey,
      draft: result.aiResponse,
    });
    setLocalConversation(nextLocal);
    setDraft(result.aiResponse);
    setInfo(
      hadResponse
        ? t("conversation.newDraft")
        : t("conversation.firstDraft"),
    );
    setIsGenerating(false);
  }

  /** Envoi de la proposition IA (éventuellement modifiée) au demandeur. */
  async function sendProposal(content: string) {
    const sendKey =
      localConversation.proposalSendKey ??
      serverDraftProposal?.sendKey ??
      crypto.randomUUID();
    const response = await fetch(`/gestion-demandes/api/tickets/${ticket.id}/send-response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: content, sendKey }),
    });
    const data = (await response.json()) as {
      ticket?: Ticket;
      error?: string;
      alreadySent?: boolean;
    };

    if (!response.ok || !data.ticket) {
      setError(data.error ? translateApiText(data.error) : translateApiText("Impossible d'envoyer la réponse."));
      return;
    }

    // Ne pas laisser un override local masquer le statut résolu serveur.
    if (getTicketLocalOverride(ticket.id)?.status) {
      clearTicketLocalOverrideField(ticket.id, "status");
    }

    upsertTicket(data.ticket);
    await refreshMessages();
    const nextLocal = patchTicketLocalConversation(ticket.id, {
      proposal: "",
      proposalCreatedAt: undefined,
      proposalSendKey: undefined,
      draft: "",
    });
    setLocalConversation(nextLocal);
    setDraft("");
    setInfo(
      data.alreadySent
        ? t("conversation.alreadySent")
        : t("conversation.responseSent"),
    );
  }

  /** Message rédigé manuellement : nouvelle intervention du demandeur (local). */
  async function sendCustomerMessage(content: string) {
    const message: TicketMessage = {
      id: `local-${crypto.randomUUID()}`,
      ticketId: ticket.id,
      senderType: "customer",
      senderName: ticket.name,
      senderEmail: ticket.email,
      content,
      direction: "inbound",
      deliveryStatus: "sent",
      sendKey: null,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const nextLocal = patchTicketLocalConversation(ticket.id, {
      messages: [...localConversation.messages, message],
      draft: "",
      proposal: "",
      proposalCreatedAt: undefined,
      proposalSendKey: undefined,
    });
    setLocalConversation(nextLocal);
    setDraft("");
    setInfo(t("conversation.messageAdded"));
  }

  async function handleSend() {
    const content = draft.trim();
    if (!content || busy) return;

    setIsSending(true);
    setError(null);
    setInfo(
      isProposalMode
        ? t("conversation.sendingResponse")
        : t("conversation.addingMessage"),
    );

    try {
      if (isProposalMode) {
        await sendProposal(content);
      } else {
        await sendCustomerMessage(content);
      }
    } catch {
      setError(t("conversation.serverUnavailable"));
      setInfo(null);
    } finally {
      setIsSending(false);
    }
  }

  function handleDraftChange(value: string) {
    setDraft(value);
    const nextLocal = patchTicketLocalConversation(ticket.id, {
      draft: value,
      ...(isProposalMode
        ? {
            proposal: value,
            proposalCreatedAt:
              localConversation.proposalCreatedAt ??
              new Date().toISOString(),
            proposalSendKey:
              localConversation.proposalSendKey ?? crypto.randomUUID(),
          }
        : {}),
    });
    setLocalConversation(nextLocal);
  }

  return (
    <section className="conversation-panel" aria-labelledby="conversation-title">
      <div className="conversation-header">
        <h2 id="conversation-title">{t("conversation.title")}</h2>
        <span className="muted" style={{ fontSize: "0.85rem" }}>
          {t("conversation.subtitle")}
        </span>
      </div>

      {loading ? <p className="muted">{t("conversation.loading")}</p> : null}

      <div className="conversation-thread" role="log" aria-live="polite">
        {!loading && threadMessages.length === 0 ? (
          <p className="muted">{t("conversation.empty")}</p>
        ) : null}
        {threadMessages.map((message) => (
          <article
            key={message.id}
            className={`conversation-bubble conversation-${message.senderType}`}
          >
            <header className="conversation-bubble-meta">
              <strong>
                {message.senderType === "customer"
                  ? message.senderName || t("conversation.requester")
                  : message.senderType === "ai"
                    ? t("conversation.ai")
                    : message.senderType === "human"
                      ? message.senderName || t("conversation.owner")
                      : t("conversation.system")}
              </strong>
              <span className="conversation-message-state">
                {message.deliveryStatus === "draft"
                  ? t("conversation.draft")
                  : message.deliveryStatus === "sending"
                    ? t("conversation.sending")
                    : message.deliveryStatus === "sent" && message.direction === "outbound"
                      ? t("conversation.sent")
                      : null}
              </span>
              <time dateTime={message.createdAt}>
                {formatDateTime(message.createdAt, locale)}
              </time>
            </header>
            <p className="conversation-bubble-body">{message.content}</p>
          </article>
        ))}
      </div>

      <div className="conversation-composer">
        <label className="field" htmlFor={`composer-${ticket.id}`}>
          <span className="field-label">
            {isProposalMode
              ? t("conversation.responseDraft")
              : t("conversation.addRequester")}
          </span>
        </label>

        {isProposalMode ? (
          <div className="conversation-composer-origin">
            <strong>{t("conversation.ai")}</strong>
            <span className="conversation-message-state">
              {t("conversation.draftNotSent")}
            </span>
            {localConversation.proposalCreatedAt ? (
              <time dateTime={localConversation.proposalCreatedAt}>
                {formatDateTime(localConversation.proposalCreatedAt, locale)}
              </time>
            ) : null}
          </div>
        ) : null}

        <textarea
          id={`composer-${ticket.id}`}
          className="control control-textarea conversation-composer-editor"
          rows={isProposalMode ? 10 : 5}
          value={draft}
          disabled={busy}
          placeholder={
            isProposalMode
              ? t("conversation.editPlaceholder")
              : t("conversation.messagePlaceholder")
          }
          onChange={(event) => handleDraftChange(event.target.value)}
        />

        {isProposalMode && needsHuman ? (
          <p className="muted conversation-response-status">
            {t("conversation.humanRequired")}
          </p>
        ) : null}

        <div className="conversation-composer-actions">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => void generateResponse()}
          >
            {isGenerating
              ? t("conversation.generating")
              : isProposalMode
                ? t("conversation.regenerate")
                : t("conversation.generate")}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={busy || !draft.trim()}
            onClick={() => void handleSend()}
          >
            {isSending
              ? t("form.sending")
              : isProposalMode
                ? t("conversation.sendResponse")
                : t("conversation.addMessage")}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="alert alert-warning" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="alert alert-success" role="status">
          {info}
        </p>
      ) : null}
    </section>
  );
}
