import { getTranslations } from "next-intl/server";
import { NotificationPreferences } from "@/features/settings/notification-preferences";

export default async function SettingsPage() {
  const t = await getTranslations("settings");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-muted">{t("subtitle")}</p>
      </div>
      <NotificationPreferences />
    </div>
  );
}
