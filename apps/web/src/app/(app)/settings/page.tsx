import { getTranslations } from "next-intl/server";
import { AnalysisDefaults } from "@/features/settings/analysis-defaults";
import { NotificationPreferences } from "@/features/settings/notification-preferences";
import { SecuritySection } from "@/features/settings/security-section";

export default async function SettingsPage() {
  const t = await getTranslations("settings");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm text-ink">{t("notificationsTitle")}</h2>
          <p className="mt-0.5 text-xs text-ink-muted">{t("notificationsSubtitle")}</p>
        </div>
        <NotificationPreferences />
      </section>

      <AnalysisDefaults />

      <SecuritySection />
    </div>
  );
}
