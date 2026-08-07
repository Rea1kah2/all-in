import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { AccountStats } from "@/features/profile/account-stats";
import { AvatarUploader } from "@/features/profile/avatar-uploader";
import { ProfileForm } from "@/features/profile/profile-form";

export default async function ProfilePage() {
  const t = await getTranslations("profile");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-muted">{t("subtitle", { name: site.name })}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm text-ink-muted">{t("photoTitle")}</h2>
        <div className="rounded-card border border-line bg-surface p-6">
          <AvatarUploader />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm text-ink-muted">{t("identityTitle")}</h2>
        <div className="rounded-card border border-line bg-surface p-6">
          <ProfileForm />
        </div>
      </section>

      <AccountStats />
    </div>
  );
}
