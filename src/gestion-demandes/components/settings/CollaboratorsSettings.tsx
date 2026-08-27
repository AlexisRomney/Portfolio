"use client";

import { useEffect, useState } from "react";
import { Button } from "@gd/components/ui/Button";
import { Card } from "@gd/components/ui/Card";
import type { TeamMember } from "@gd/types/teamMember";
import { TICKET_DEPARTMENTS } from "@gd/types/ticket";
import { useI18n } from "@gd/i18n";

type Draft = {
  name: string;
  email: string;
  department: string;
  role: string;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  email: "",
  department: "IT Support",
  role: "",
};

export function CollaboratorsSettings() {
  const { t, departmentLabel, translateApiText } = useI18n();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  async function loadMembers() {
    try {
      const response = await fetch("/gestion-demandes/api/team-members", { cache: "no-store" });
      const data = (await response.json()) as {
        members?: TeamMember[];
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ? translateApiText(data.error) : t("collaborators.loadError"));
        return;
      }
      setMembers(data.members ?? []);
      setError(null);
    } catch {
      setError(t("collaborators.loadError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/gestion-demandes/api/team-members", { cache: "no-store" });
        const data = (await response.json()) as {
          members?: TeamMember[];
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok) {
          setError(data.error ? translateApiText(data.error) : t("collaborators.loadError"));
          return;
        }
        setMembers(data.members ?? []);
        setError(null);
      } catch {
        if (!cancelled) {
          setError(t("collaborators.loadError"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [t, translateApiText]);

  function startCreate() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setShowForm(true);
    setInfo(null);
    setError(null);
  }

  function startEdit(member: TeamMember) {
    setEditingId(member.id);
    setDraft({
      name: member.name,
      email: member.email,
      department: member.department,
      role: member.role,
    });
    setShowForm(true);
    setInfo(null);
    setError(null);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  }

  async function submitForm() {
    setSaving(true);
    setError(null);
    setInfo(null);

    try {
      const response = await fetch(
        editingId ? `/gestion-demandes/api/team-members/${editingId}` : "/gestion-demandes/api/team-members",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      const data = (await response.json()) as {
        member?: TeamMember;
        error?: string;
      };
      if (!response.ok || !data.member) {
        setError(data.error ? translateApiText(data.error) : t("collaborators.saveImpossible"));
        setSaving(false);
        return;
      }

      setInfo(editingId ? t("collaborators.updated") : t("collaborators.added"));
      cancelForm();
      await loadMembers();
    } catch {
      setError(t("collaborators.saveError"));
    }

    setSaving(false);
  }

  async function toggleActive(member: TeamMember) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/gestion-demandes/api/team-members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !member.active }),
      });
      const data = (await response.json()) as {
        member?: TeamMember;
        error?: string;
      };
      if (!response.ok || !data.member) {
        setError(data.error ? translateApiText(data.error) : t("collaborators.statusError"));
        setSaving(false);
        return;
      }
      await loadMembers();
      setInfo(
        data.member.active
          ? `${data.member.name} ${t("collaborators.activeSuffix")}`
          : `${data.member.name} ${t("collaborators.inactiveSuffix")}`,
      );
    } catch {
      setError(t("collaborators.statusError"));
    }
    setSaving(false);
  }

  return (
    <Card className="settings-card">
      <div className="section-card-header" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>{t("collaborators.title")}</h2>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={startCreate}
          disabled={saving}
        >
          + {t("common.add")}
        </Button>
      </div>

      <p className="muted" style={{ fontSize: "0.88rem", marginBottom: "1rem" }}>
        {t("collaborators.description")}
      </p>

      {loading ? <p className="muted">{t("common.loading")}</p> : null}

      {!loading && members.length === 0 ? (
        <p className="muted">{t("collaborators.empty")}</p>
      ) : null}

      <ul className="collaborators-list">
        {members.map((member) => (
          <li key={member.id} className="collaborator-row">
            <div>
              <p style={{ fontWeight: 600, margin: 0 }}>
                {member.name}
                {!member.active ? (
                  <span className="ai-chip ai-chip-muted" style={{ marginLeft: "0.5rem" }}>
                    {t("collaborators.inactive")}
                  </span>
                ) : null}
              </p>
              <p className="muted" style={{ fontSize: "0.88rem", margin: 0 }}>
                {departmentLabel(member.department)}
                {member.role ? ` · ${member.role}` : ""}
              </p>
              <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
                {member.email}
              </p>
            </div>
            <div className="collaborator-actions">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={saving}
                onClick={() => startEdit(member)}
              >
                {t("common.edit")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={saving}
                onClick={() => void toggleActive(member)}
              >
                {member.active ? t("common.disable") : t("common.enable")}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {showForm ? (
        <div className="collaborator-form">
          <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
            {editingId ? t("collaborators.edit") : t("collaborators.new")}
          </h3>
          <div className="form-grid form-grid-simple">
            <label className="field">
              <span className="field-label">{t("common.name")}</span>
              <input
                className="control"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                disabled={saving}
              />
            </label>
            <label className="field">
              <span className="field-label">{t("common.email")}</span>
              <input
                className="control"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                disabled={saving}
              />
            </label>
            <label className="field">
              <span className="field-label">{t("common.service")}</span>
              <select
                className="control"
                value={draft.department}
                onChange={(e) =>
                  setDraft({ ...draft, department: e.target.value })
                }
                disabled={saving}
              >
                {TICKET_DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {departmentLabel(department)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">{t("common.role")}</span>
              <input
                className="control"
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                disabled={saving}
                placeholder={t("collaborators.rolePlaceholder")}
              />
            </label>
          </div>
          <div className="ai-response-actions">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={cancelForm}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={saving || !draft.name.trim() || !draft.email.trim()}
              onClick={() => void submitForm()}
            >
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </div>
      ) : null}

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
    </Card>
  );
}
