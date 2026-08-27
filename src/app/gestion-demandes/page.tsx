"use client";

import { Card } from "@gd/components/ui/Card";
import { Header } from "@gd/components/layout/Header";
import { RequestForm } from "@gd/components/requests/RequestForm";
import { useI18n } from "@gd/i18n";

export default function HomePage() {
  const { t } = useI18n();
  return (
    <div className="public-page">
      <Header
        title={t("home.title")}
        subtitle={t("home.subtitle")}
        showNewRequest={false}
      />
      <Card>
        <RequestForm />
      </Card>
    </div>
  );
}
