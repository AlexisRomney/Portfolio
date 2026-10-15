"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applyDemoTicketLocale } from "@gd/data/demo-ticket-locales";
import { useI18n } from "@gd/i18n";
import {
  applyOverridesToTickets,
  applyTicketLocalOverride,
  setTicketLocalOverride,
  type TicketLocalOverride,
} from "@gd/lib/ticket-local-overrides";
import type { Ticket } from "@gd/types/ticket";

type TicketsContextValue = {
  tickets: Ticket[];
  isReady: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getById: (id: string) => Ticket | undefined;
  upsertTicket: (ticket: Ticket) => void;
  /** Override local (localStorage), ne touche pas Neon. */
  applyLocalTicketPatch: (
    ticketId: string,
    patch: TicketLocalOverride,
    baseTicket?: Ticket,
  ) => Ticket | null;
};

const TicketsContext = createContext<TicketsContextValue | null>(null);

async function fetchTickets(): Promise<Ticket[]> {
  const response = await fetch("/gestion-demandes/api/tickets", { cache: "no-store" });
  const payload = (await response.json()) as {
    tickets?: Ticket[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || "Impossible de charger les tickets.");
  }

  return payload.tickets ?? [];
}

function presentTickets(rawTickets: Ticket[], locale: "fr" | "en"): Ticket[] {
  const localized = rawTickets.map((ticket) =>
    applyDemoTicketLocale(ticket, locale),
  );
  return applyOverridesToTickets(localized);
}

export function TicketsProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const [rawTickets, setRawTickets] = useState<Ticket[]>([]);
  const [overridesEpoch, setOverridesEpoch] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tickets = useMemo(() => {
    void overridesEpoch;
    return presentTickets(rawTickets, locale);
  }, [rawTickets, locale, overridesEpoch]);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchTickets();
      setRawTickets(next);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les tickets.",
      );
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchTickets();
        if (cancelled) return;
        setRawTickets(next);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les tickets.",
        );
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const getById = useCallback(
    (id: string) => tickets.find((ticket) => ticket.id === id),
    [tickets],
  );

  const upsertTicket = useCallback((ticket: Ticket) => {
    setRawTickets((current) => {
      const index = current.findIndex((item) => item.id === ticket.id);
      if (index === -1) {
        return [ticket, ...current];
      }
      const next = [...current];
      next[index] = ticket;
      return next;
    });
  }, []);

  const applyLocalTicketPatch = useCallback(
    (
      ticketId: string,
      patch: TicketLocalOverride,
      baseTicket?: Ticket,
    ): Ticket | null => {
      const override = setTicketLocalOverride(ticketId, patch);
      setOverridesEpoch((value) => value + 1);

      const raw =
        rawTickets.find((ticket) => ticket.id === ticketId) ?? baseTicket;
      if (!raw) return null;

      return applyTicketLocalOverride(
        applyDemoTicketLocale(raw, locale),
        override,
      );
    },
    [locale, rawTickets],
  );

  const value = useMemo(
    () => ({
      tickets,
      isReady,
      error,
      refresh,
      getById,
      upsertTicket,
      applyLocalTicketPatch,
    }),
    [
      tickets,
      isReady,
      error,
      refresh,
      getById,
      upsertTicket,
      applyLocalTicketPatch,
    ],
  );

  return (
    <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
  );
}

export function useTickets(): TicketsContextValue {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error("useTickets must be used within TicketsProvider");
  }
  return context;
}
