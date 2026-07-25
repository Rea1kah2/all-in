"use client";

import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { useSession, useUpdateUser } from "@/features/auth/use-auth";

export function NotificationPreferences() {
  const { data: user } = useSession();
  const updateUser = useUpdateUser();
  const t = useTranslations("settings");

  if (!user) {
    return <div className="h-32 w-full max-w-md animate-pulse rounded-card bg-surface" />;
  }

  return (
    <div className="max-w-md space-y-4 rounded-card border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink">{t("notifyPriceAlert")}</p>
          <p className="mt-0.5 text-ink-muted text-xs">{t("notifyPriceAlertHint")}</p>
        </div>
        <Switch
          checked={user.notifyPriceAlert}
          onCheckedChange={(checked) => updateUser.mutate({ notifyPriceAlert: checked })}
          aria-label={t("notifyPriceAlert")}
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-line border-t pt-4">
        <div>
          <p className="text-sm text-ink">{t("notifyNewsDigest")}</p>
          <p className="mt-0.5 text-ink-muted text-xs">{t("notifyNewsDigestHint")}</p>
        </div>
        <Switch
          checked={user.notifyNewsDigest}
          onCheckedChange={(checked) => updateUser.mutate({ notifyNewsDigest: checked })}
          aria-label={t("notifyNewsDigest")}
        />
      </div>
    </div>
  );
}
