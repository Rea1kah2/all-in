"use client";

import { useFormatter, useTranslations } from "next-intl";
import { BellIcon, BulbIcon, StarIcon } from "@/components/icons";
import { useSession } from "@/features/auth/use-auth";
import { useProfileStats } from "@/features/profile/use-profile-stats";

export function AccountStats() {
  const { data: user } = useSession();
  const stats = useProfileStats();
  const t = useTranslations("profile");
  const format = useFormatter();

  const items = [
    { key: "analyses", Icon: BulbIcon, value: stats.data?.analyses },
    { key: "watchlist", Icon: StarIcon, value: stats.data?.watchlist },
    { key: "alerts", Icon: BellIcon, value: stats.data?.alerts },
  ] as const;

  return (
    <section className="space-y-4">
      <h2 className="text-sm text-ink-muted">{t("statsTitle")}</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        {items.map(({ key, Icon, value }) => (
          <div key={key} className="rounded-card border border-line bg-surface p-5">
            <div className="flex items-center gap-2 text-ink-muted">
              <Icon size={15} />
              <p className="text-xs">{t(`stats.${key}`)}</p>
            </div>
            {stats.isPending ? (
              <div className="mt-2 h-8 w-12 animate-pulse rounded-badge bg-surface-hover" />
            ) : (
              <p className="mt-1 font-mono text-2xl text-ink">{value ?? 0}</p>
            )}
          </div>
        ))}
      </div>

      {user ? (
        <p className="text-xs text-ink-faint">
          {t("joinedAt", {
            date: format.dateTime(new Date(user.createdAt), {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          })}
        </p>
      ) : null}
    </section>
  );
}
