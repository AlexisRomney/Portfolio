"use client";

import type { TicketFilters } from "@gd/lib/filters";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@gd/types/ticket";
import { SelectInput, TextInput } from "@gd/components/ui/Field";
import { useI18n } from "@gd/i18n";

type Props = {
  filters: TicketFilters;
  onChange: (next: TicketFilters) => void;
  resultCount: number;
};

export function RequestFiltersBar({ filters, onChange, resultCount }: Props) {
  const { t, categoryLabel, priorityLabel, statusLabel } = useI18n();
  return (
    <div className="filters-bar">
      <div className="filters-grid">
        <label className="filter-field filter-search">
          <span className="field-label">{t("filters.search")}</span>
          <TextInput
            type="search"
            placeholder={t("filters.searchPlaceholder")}
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
          />
        </label>

        <label className="filter-field">
          <span className="field-label">{t("filters.category")}</span>
          <SelectInput
            value={filters.category}
            onChange={(event) =>
              onChange({
                ...filters,
                category: event.target.value as TicketCategory | "all",
              })
            }
          >
            <option value="all">{t("filters.allF")}</option>
            {TICKET_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {categoryLabel(category)}
              </option>
            ))}
          </SelectInput>
        </label>

        <label className="filter-field">
          <span className="field-label">{t("filters.priority")}</span>
          <SelectInput
            value={filters.priority}
            onChange={(event) =>
              onChange({
                ...filters,
                priority: event.target.value as TicketPriority | "all",
              })
            }
          >
            <option value="all">{t("filters.allF")}</option>
            {TICKET_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabel(priority)}
              </option>
            ))}
          </SelectInput>
        </label>

        <label className="filter-field">
          <span className="field-label">{t("filters.status")}</span>
          <SelectInput
            value={filters.status}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target.value as TicketStatus | "all",
              })
            }
          >
            <option value="all">{t("filters.allM")}</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </SelectInput>
        </label>

        <label className="filter-field">
          <span className="field-label">{t("filters.sort")}</span>
          <SelectInput
            value={filters.sort}
            onChange={(event) =>
              onChange({
                ...filters,
                sort: event.target.value as TicketFilters["sort"],
              })
            }
          >
            <option value="date_desc">{t("filters.newest")}</option>
            <option value="date_asc">{t("filters.oldest")}</option>
          </SelectInput>
        </label>
      </div>

      <p className="filters-count muted">
        {resultCount} {t(resultCount === 1 ? "filters.resultOne" : "filters.resultMany")}
      </p>
    </div>
  );
}
