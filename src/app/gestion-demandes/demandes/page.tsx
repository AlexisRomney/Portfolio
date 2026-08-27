"use client";

import { useMemo, useState } from "react";
import { Header } from "@gd/components/layout/Header";
import { RequestFiltersBar } from "@gd/components/requests/RequestFilters";
import { RequestTable } from "@gd/components/requests/RequestTable";
import { Card } from "@gd/components/ui/Card";
import {
  DEFAULT_FILTERS,
  filterAndSortTickets,
  type TicketFilters,
} from "@gd/lib/filters";
import { useTickets } from "@gd/lib/tickets-store";
import { useI18n } from "@gd/i18n";

export default function DemandesPage() {
  const { tickets, isReady, error, refresh } = useTickets();
  const { t, translateApiText } = useI18n();
  const [filters, setFilters] = useState<TicketFilters>(DEFAULT_FILTERS);

  const filteredTickets = useMemo(
    () => filterAndSortTickets(tickets, filters),
    [tickets, filters],
  );

  return (
    <div>
      <Header
        title={t("requests.title")}
        subtitle={t("requests.subtitle")}
      />

      {error ? (
        <Card className="section-card" style={{ marginBottom: "1rem" }}>
          <p className="alert alert-warning" role="alert">
            {translateApiText(error)}
          </p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => void refresh()}>
            {t("common.retry")}
          </button>
        </Card>
      ) : null}

      <Card className="section-card">
        {!isReady ? (
          <p className="muted">{t("requests.loading")}</p>
        ) : (
          <>
            <RequestFiltersBar
              filters={filters}
              onChange={setFilters}
              resultCount={filteredTickets.length}
            />
            <RequestTable requests={filteredTickets} />
          </>
        )}
      </Card>
    </div>
  );
}
