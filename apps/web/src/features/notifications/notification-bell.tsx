"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BellIcon, BulbIcon, NewsIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSession } from "@/features/auth/use-auth";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/use-notifications";
import { cn, formatPrice, relativeTime } from "@/lib/utils";
import type { Notification } from "@/types/notification";

function NotificationLabel({ item }: { item: Notification }) {
  const t = useTranslations("notifications");
  const tVerdict = useTranslations("verdict");

  if (item.type === "price_alert") {
    return (
      <>
        {t("priceAlert", {
          ticker: item.ticker,
          condition: t(item.condition === "above" ? "conditionAbove" : "conditionBelow"),
          price: formatPrice(item.targetPrice, "USD"),
        })}
      </>
    );
  }

  if (item.type === "analysis_done") {
    return (
      <>
        {t("analysisDone", {
          ticker: item.ticker,
          recommendation: tVerdict(`${item.recommendation}.label`),
        })}
      </>
    );
  }

  return <>{t("news", { ticker: item.ticker })}</>;
}

function NotificationRow({
  item,
  locale,
  onRead,
}: {
  item: Notification;
  locale: string;
  onRead: () => void;
}) {
  const Icon =
    item.type === "price_alert"
      ? BellIcon
      : item.type === "analysis_done"
        ? BulbIcon
        : NewsIcon;

  return (
    <Link
      href={item.href}
      onClick={() => {
        if (!item.read) onRead();
      }}
      className={cn(
        "flex items-start gap-3 border-line border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-hover",
        !item.read && "bg-brass-bg/20",
      )}
    >
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-hover text-ink-muted">
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-ink">
          <NotificationLabel item={item} />
        </p>
        <p className="mt-0.5 text-xs text-ink-faint">
          {relativeTime(item.createdAt, locale)}
        </p>
      </div>
      {!item.read ? (
        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brass" />
      ) : null}
    </Link>
  );
}

export function NotificationBell() {
  const { data: user } = useSession();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const t = useTranslations("notifications");
  const locale = useLocale();

  if (!user) return null;

  const items = notifications.data ?? [];
  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("open")} className="relative">
          <BellIcon size={18} />
          {unreadCount > 0 ? (
            <span className="-right-0.5 -top-0.5 absolute flex size-4 items-center justify-center rounded-full bg-bear font-mono text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-line border-b px-4 py-3">
          <p className="text-sm text-ink">{t("title")}</p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="text-teal text-xs hover:underline"
            >
              {t("markAllRead")}
            </button>
          ) : null}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-muted">{t("empty")}</p>
          ) : (
            items.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                locale={locale}
                onRead={() => markRead.mutate(item.id)}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
