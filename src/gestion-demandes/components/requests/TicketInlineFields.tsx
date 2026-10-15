"use client";

import { useEffect, useState } from "react";
import { PriorityBadge, StatusBadge } from "@gd/components/ui/Badge";
import { DemoSelect } from "@gd/components/ui/DemoSelect";
import { departmentsCompatible } from "@gd/lib/departments";
import {
  isFieldLocallyOverridden,
  type TicketLocalOverride,
} from "@gd/lib/ticket-local-overrides";
import { useTickets } from "@gd/lib/tickets-store";
import type { TeamMember } from "@gd/types/teamMember";
import type {
  Ticket,
  TicketCategory,
  TicketDepartment,
  TicketPriority,
  TicketStatus,
} from "@gd/types/ticket";
import { useI18n } from "@gd/i18n";
import {
  TICKET_CATEGORIES,
  TICKET_DEPARTMENTS,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@gd/types/ticket";

type Props = {
  ticket: Ticket;
};

function ManualHint({ show }: { show: boolean }) {
  const { t } = useI18n();
  if (!show) return null;
  return <span className="manual-override-hint">{t("common.manuallyModified")}</span>;
}

export function useActiveTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/gestion-demandes/api/team-members", { cache: "no-store" });
        const data = (await response.json()) as { members?: TeamMember[] };
        if (cancelled) return;
        setMembers((data.members ?? []).filter((m) => m.active));
      } catch {
        // ignore
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return members;
}

function useLocalPatch(ticket: Ticket) {
  const { applyLocalTicketPatch } = useTickets();
  return (next: TicketLocalOverride) => {
    applyLocalTicketPatch(ticket.id, next, ticket);
  };
}

export function EditableStatusField({ ticket }: Props) {
  const patch = useLocalPatch(ticket);
  const { t, statusLabel } = useI18n();

  return (
    <div className="meta-item meta-item-editable">
      <span className="meta-label">
        {t("common.status")}
        <ManualHint show={isFieldLocallyOverridden(ticket.id, "status")} />
      </span>
      <DemoSelect
        className="meta-inline-select"
        aria-label={`${t("common.modify")} ${t("common.status").toLocaleLowerCase()}`}
        value={ticket.status}
        options={TICKET_STATUSES.map((status) => ({
          value: status,
          label: statusLabel(status),
        }))}
        onChange={(next) => patch({ status: next as TicketStatus })}
        renderValue={() => <StatusBadge status={ticket.status} />}
      />
    </div>
  );
}

export function EditablePriorityField({ ticket }: Props) {
  const patch = useLocalPatch(ticket);
  const { t, priorityLabel } = useI18n();

  return (
    <div className="meta-item meta-item-editable">
      <span className="meta-label">
        {t("filters.priority")}
        <ManualHint show={isFieldLocallyOverridden(ticket.id, "priority")} />
      </span>
      <DemoSelect
        className="meta-inline-select"
        aria-label={`${t("common.modify")} ${t("filters.priority").toLocaleLowerCase()}`}
        value={ticket.priority ?? ""}
        options={[
          { value: "", label: t("common.undefinedF") },
          ...TICKET_PRIORITIES.map((priority) => ({
            value: priority,
            label: priorityLabel(priority),
          })),
        ]}
        onChange={(next) =>
          patch({ priority: (next || null) as TicketPriority | null })
        }
        renderValue={() => <PriorityBadge priority={ticket.priority} />}
      />
    </div>
  );
}

export function EditableCategoryField({ ticket }: Props) {
  const patch = useLocalPatch(ticket);
  const { t, categoryLabel } = useI18n();

  return (
    <div className="meta-item meta-item-editable">
      <span className="meta-label">
        {t("filters.category")}
        <ManualHint show={isFieldLocallyOverridden(ticket.id, "category")} />
      </span>
      <DemoSelect
        className="meta-inline-select"
        aria-label={`${t("common.modify")} ${t("filters.category").toLocaleLowerCase()}`}
        value={ticket.category ?? ""}
        options={[
          { value: "", label: t("common.undefinedF") },
          ...TICKET_CATEGORIES.map((category) => ({
            value: category,
            label: categoryLabel(category),
          })),
        ]}
        onChange={(next) =>
          patch({ category: (next || null) as TicketCategory | null })
        }
      />
    </div>
  );
}

export function EditableDepartmentField({
  ticket,
  members,
}: Props & { members: TeamMember[] }) {
  const patch = useLocalPatch(ticket);
  const { t, departmentLabel } = useI18n();

  function handleChange(next: string) {
    const department = next as TicketDepartment;
    const compatibleMembers = members.filter((member) =>
      departmentsCompatible(member.department, department),
    );
    // Le collaborateur est recalculé parmi les actifs du nouveau service.
    const nextAssignee =
      compatibleMembers.find((member) => member.id === ticket.assigneeId) ??
      compatibleMembers[0] ??
      null;

    patch({
      department,
      assigneeId: nextAssignee?.id ?? null,
      assigneeName: nextAssignee?.name ?? null,
    });
  }

  return (
    <div className="meta-item meta-item-editable">
      <span className="meta-label">
        {t("common.service")}
        <ManualHint
          show={isFieldLocallyOverridden(ticket.id, "department")}
        />
      </span>
      <DemoSelect
        className="meta-inline-select"
        aria-label={`${t("common.modify")} ${t("common.service").toLocaleLowerCase()}`}
        value={ticket.department ?? ""}
        options={[
          { value: "", label: t("common.undefined") },
          ...TICKET_DEPARTMENTS.map((department) => ({
            value: department,
            label: departmentLabel(department),
          })),
        ]}
        onChange={(department) => {
          if (!department) {
            patch({
              department: null,
              assigneeId: null,
              assigneeName: null,
            });
            return;
          }
          handleChange(department);
        }}
      />
    </div>
  );
}

export function TicketOwnerField({ ticket }: Props) {
  const { t, departmentLabel } = useI18n();
  return (
    <div className="ai-result-item">
      <span className="meta-label">{t("routing.owner")}</span>
      <span className="meta-value">
        {ticket.assigneeName
          ? `${ticket.assigneeName}${
              ticket.department ? ` (${departmentLabel(ticket.department)})` : ""
            }`
          : t("routing.unassigned")}
      </span>
    </div>
  );
}

export function EditableAssigneeField({
  ticket,
  members,
  label = "Collaborateur attribué",
}: Props & { members: TeamMember[]; label?: string }) {
  const patch = useLocalPatch(ticket);
  const { locale, t } = useI18n();
  const displayedLabel = label === "Collaborateur attribué" ? t("routing.assignee") : label;
  const compatibleMembers = ticket.department
    ? members.filter((member) =>
        departmentsCompatible(member.department, ticket.department!),
      )
    : [];

  const options = [
    { value: "", label: t("routing.unassigned") },
    ...compatibleMembers.map((member) => ({
      value: member.id,
      label: member.name,
    })),
  ];

  return (
    <div className="meta-item meta-item-editable">
      <span className="meta-label">
        {displayedLabel}
        <ManualHint
          show={
            isFieldLocallyOverridden(ticket.id, "assigneeId") ||
            isFieldLocallyOverridden(ticket.id, "assigneeName")
          }
        />
      </span>
      <DemoSelect
        className="meta-inline-select"
        aria-label={`${t("common.modify")} ${displayedLabel.toLocaleLowerCase(locale)}`}
        value={ticket.assigneeId ?? ""}
        options={options}
        onChange={(memberId) => {
          if (!memberId) {
            patch({ assigneeId: null, assigneeName: null });
            return;
          }
          const member = compatibleMembers.find((item) => item.id === memberId);
          if (!member) return;
          patch({
            assigneeId: member.id,
            assigneeName: member.name,
          });
        }}
      />
    </div>
  );
}

