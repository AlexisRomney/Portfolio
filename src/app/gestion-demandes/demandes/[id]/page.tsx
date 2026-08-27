"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@gd/components/layout/Header";
import { AiControlPanel } from "@gd/components/requests/AiControlPanel";
import { AiRoutingPanel } from "@gd/components/requests/AiRoutingPanel";
import { AutomationActionPanel } from "@gd/components/requests/AutomationActionPanel";
import { ConversationPanel } from "@gd/components/requests/ConversationPanel";
import { TicketAnalysisSection } from "@gd/components/requests/TicketAnalysisSection";
import { Button } from "@gd/components/ui/Button";
import { Card } from "@gd/components/ui/Card";
import { formatDateTime } from "@gd/lib/labels";
import {
  applyTicketLocalOverride,
  getTicketLocalOverride,
} from "@gd/lib/ticket-local-overrides";
import { useTickets } from "@gd/lib/tickets-store";
import type { Ticket } from "@gd/types/ticket";
import { applyDemoTicketLocale } from "@gd/data/demo-ticket-locales";
import { useI18n } from "@gd/i18n";

function DetailLoadingShell() {
  const { t } = useI18n();
  return (
    <div className="detail-page">
      <Header title={t("detail.title")} />
      <Card className="section-card">
        <p className="muted">{t("detail.loading")}</p>
      </Card>
    </div>
  );
}

export default function DemandeDetailPage() {
  const params = useParams<{ id: string }>();
  const { getById, isReady, upsertTicket } = useTickets();
  const { locale, t, translateApiText } = useI18n();
  const ticketId = typeof params.id === "string" ? params.id : params.id?.[0];
  const [remoteTicket, setRemoteTicket] = useState<Ticket | null>(null);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(true);

  const cached = ticketId ? getById(ticketId) : undefined;

  useEffect(() => {
    if (!isReady || !ticketId || cached) {
      return;
    }

    let cancelled = false;

    async function load() {
      setRemoteLoading(true);
      try {
        const response = await fetch(`/gestion-demandes/api/tickets/${ticketId}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          ticket?: Ticket;
          error?: string;
        };

        if (cancelled) return;

        if (!response.ok || !payload.ticket) {
          setRemoteError(payload.error ? translateApiText(payload.error) : t("detail.notFound"));
          setRemoteTicket(null);
          return;
        }

        setRemoteTicket(
          applyTicketLocalOverride(
            payload.ticket,
            getTicketLocalOverride(payload.ticket.id),
          ),
        );
        upsertTicket(payload.ticket);
        setRemoteError(null);
      } catch {
        if (!cancelled) {
          setRemoteError(translateApiText("Impossible de charger le ticket."));
        }
      } finally {
        if (!cancelled) setRemoteLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [cached, isReady, ticketId, t, translateApiText, upsertTicket]);

  const ticket = cached
    ?? (remoteTicket
      ? applyDemoTicketLocale(remoteTicket, locale)
      : null);
  const loading = !isReady || (!ticket && remoteLoading);

  if (loading) {
    return <DetailLoadingShell />;
  }

  if (!ticket) {
    return (
      <div className="detail-page">
        <Link href="/gestion-demandes/demandes" className="back-link">
          {t("detail.back")}
        </Link>
        <Header title={t("detail.notFound")} />
        <Card className="section-card">
          <p className="muted" style={{ marginBottom: "1rem" }}>
            {remoteError || t("detail.notFoundText")}
          </p>
          <Button href="/gestion-demandes/demandes" variant="secondary">
            {t("detail.backList")}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Link href="/gestion-demandes/demandes" className="back-link">
        {t("detail.back")}
      </Link>
      <Header title={t("detail.title")} subtitle={`${t("detail.reference")} ${ticket.id}`} />

      <Card className="detail-card detail-hero">
        <h2 className="detail-title">{ticket.subject}</h2>
        <div className="detail-meta">
          <div className="meta-item">
            <span className="meta-label">{t("common.name")}</span>
            <span className="meta-value">{ticket.name}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">{t("common.email")}</span>
            <span className="meta-value">{ticket.email}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">{t("detail.createdAt")}</span>
            <span className="meta-value">{formatDateTime(ticket.createdAt, locale)}</span>
          </div>
        </div>

        <TicketAnalysisSection ticket={ticket} />
        <AiRoutingPanel ticket={ticket} />
      </Card>

      <div className="detail-workspace">
        <Card className="detail-card detail-conversation-card">
          <ConversationPanel ticket={ticket} />
        </Card>

        <div className="detail-side">
          <div className="detail-ai-grid detail-ai-stack">
            <AiControlPanel ticket={ticket} />
          </div>
          <div className="detail-automation">
            <AutomationActionPanel key={ticket.id} ticket={ticket} />
          </div>
        </div>
      </div>
    </div>
  );
}
