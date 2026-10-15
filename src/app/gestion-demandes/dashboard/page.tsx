"use client";

import Link from "next/link";
import { Header } from "@gd/components/layout/Header";
import { RequestTable } from "@gd/components/requests/RequestTable";
import { Card, StatCard } from "@gd/components/ui/Card";
import { getTicketStats } from "@gd/lib/filters";
import { useTickets } from "@gd/lib/tickets-store";
import { TICKET_CATEGORIES, TICKET_DEPARTMENTS } from "@gd/types/ticket";
import { useI18n } from "@gd/i18n";

export default function DashboardPage() {
  const { tickets, isReady, error, refresh } = useTickets();
  const { t, categoryLabel, departmentLabel, translateApiText } = useI18n();
  const stats = getTicketStats(tickets);
  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div>
      <Header
        title={t("brand.name")}
        subtitle={t("dashboard.subtitle")}
      />

      {error ? (
        <Card className="section-card" style={{ marginBottom: "1rem" }}>
          <p className="alert alert-warning" role="alert">
            {translateApiText(error)}
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => void refresh()}
          >
            {t("common.retry")}
          </button>
        </Card>
      ) : null}

      {!isReady ? (
        <Card className="section-card">
          <p className="muted">{t("dashboard.loading")}</p>
        </Card>
      ) : (
        <>
          <section className="stats-grid" aria-label={t("dashboard.indicators")}>
            <StatCard label={t("dashboard.tickets")} value={stats.total} />
            <StatCard
              label={t("dashboard.awaiting")}
              value={stats.awaiting}
              tone="warning"
            />
            <StatCard label={t("dashboard.urgent")} value={stats.urgent} tone="danger" />
            <StatCard
              label={t("dashboard.escalated")}
              value={stats.escalated}
              tone="warning"
            />
            <StatCard label={t("dashboard.assigned")} value={stats.assigned} />
            <StatCard label={t("dashboard.emails")} value={stats.emailsSent} />
            <StatCard label={t("dashboard.inProgress")} value={stats.inProgress} />
            <StatCard label={t("dashboard.resolved")} value={stats.resolved} />
            <StatCard
              label={t("dashboard.automationRate")}
              value={
                stats.automationRatePercent === null
                  ? t("common.notApplicable")
                  : `${stats.automationRatePercent} %`
              }
            />
            <StatCard
              label={t("dashboard.aiScore")}
              value={
                stats.controlAverageScore === null
                  ? t("common.notApplicable")
                  : `${Math.round(stats.controlAverageScore * 100)} %`
              }
            />
          </section>

          <div className="dashboard-split">
            <Card className="section-card category-stats-card">
              <div className="section-card-header">
                <h2>{t("dashboard.byCategory")}</h2>
                <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
                  {t("dashboard.aiAnalysis")}
                </p>
              </div>
              <ul className="category-stats-list">
                {TICKET_CATEGORIES.map((category) => (
                  <li key={category} className="category-stats-item">
                    <span>{categoryLabel(category)}</span>
                    <strong>{stats.byCategory[category] ?? 0}</strong>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="section-card category-stats-card">
              <div className="section-card-header">
                <h2>{t("dashboard.byDepartment")}</h2>
                <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
                  {t("dashboard.aiRouting")}
                </p>
              </div>
              <ul className="category-stats-list">
                {TICKET_DEPARTMENTS.map((department) => (
                  <li key={department} className="category-stats-item">
                    <span>{departmentLabel(department)}</span>
                    <strong>{stats.byDepartment[department] ?? 0}</strong>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="section-card category-stats-card">
            <div className="section-card-header">
              <h2>{t("dashboard.controls")}</h2>
              <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
                {t("dashboard.validation")}
              </p>
            </div>
            {stats.controlChecked === 0 ? (
              <p className="muted">{t("dashboard.noControls")}</p>
            ) : (
              <ul className="category-stats-list control-stats-list">
                <li className="category-stats-item">
                  <span>{t("dashboard.checked")}</span>
                  <strong>{stats.controlChecked}</strong>
                </li>
                <li className="category-stats-item">
                  <span>{t("dashboard.approved")}</span>
                  <strong>
                    {Math.round(
                      (stats.controlApproved / stats.controlChecked) * 100,
                    )}{" "}
                    %
                  </strong>
                </li>
                <li className="category-stats-item">
                  <span>{t("dashboard.humanReview")}</span>
                  <strong>
                    {Math.round(
                      (stats.controlNeedsReview / stats.controlChecked) * 100,
                    )}{" "}
                    %
                  </strong>
                </li>
                <li className="category-stats-item">
                  <span>{t("dashboard.averageScore")}</span>
                  <strong>
                    {stats.controlAverageScore === null
                      ? t("common.notApplicable")
                      : `${Math.round(stats.controlAverageScore * 100)} %`}
                  </strong>
                </li>
              </ul>
            )}
          </Card>

          <Card className="section-card">
            <div className="section-card-header">
              <h2>{t("dashboard.recent")}</h2>
              <Link
                href="/gestion-demandes/demandes"
                className="back-link"
                style={{ marginBottom: 0 }}
              >
                {t("dashboard.viewAll")}
              </Link>
            </div>
            <RequestTable requests={recentTickets} />
          </Card>
        </>
      )}
    </div>
  );
}
