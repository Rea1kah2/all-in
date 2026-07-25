import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/features/settings/profile-form";

export default async function ProfileSettingsPage() {
  const t = await getTranslations("settings");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl text-ink">{t("profileTitle")}</h1>
        <p className="text-sm text-ink-muted">{t("profileSubtitle")}</p>
      </div>
      <ProfileForm />
    </div>
  );
}
