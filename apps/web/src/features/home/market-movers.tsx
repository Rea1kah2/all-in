"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons";
import { TrendingDownIcon, TrendingUpIcon } from "@/components/icons";
import { useMarket } from "@/features/market/use-market";
import { cn, formatPercent, formatPrice } from "@/lib/utils";
import type { Mover } from "@/types/market";

function MoverRow({ mover }: { mover: Mover }) {
  const positive = mover.changePercent >= 0;
  return (
    <Link
      href={`/companies/${mover.ticker}`}
      className="flex items-center justify-between gap-3 rounded-badge px-2 py-2 transition-colors hover:bg-surface-hover"
    >
      <div className="min-w-0">
        <p className="font-mono text-sm text-ink">{mover.ticker}</p>
        <p className="truncate text-xs text-ink-muted">{mover.name}</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-xs text-ink">{formatPrice(mover.price, "USD")}</p>
        <p className={cn("font-mono text-xs", positive ? "text-bull" : "text-bear")}>
          {formatPercent(mover.changePercent)}
        </p>
      </div>
    </Link>
  );
}

function MoverColumn({
  title,
  Icon,
  movers,
}: {
  title: string;
  Icon: ComponentType<IconProps>;
  movers: Mover[];
}) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="mb-2 flex items-center gap-2 px-2 text-ink-muted">
        <Icon size={15} />
        <h3 className="text-xs">{title}</h3>
      </div>
      <div className="space-y-1">
        {movers.map((mover) => (
          <MoverRow key={mover.ticker} mover={mover} />
        ))}
      </div>
    </div>
  );
}

export function MarketMovers() {
  const market = useMarket();
  const t = useTranslations("home");

  if (market.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((key) => (
          <div
            key={key}
            className="h-44 animate-pulse rounded-card border border-line bg-surface"
          />
        ))}
      </div>
    );
  }

  if (market.isError || !market.data) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MoverColumn
        title={t("gainers")}
        Icon={TrendingUpIcon}
        movers={market.data.gainers}
      />
      <MoverColumn
        title={t("losers")}
        Icon={TrendingDownIcon}
        movers={market.data.losers}
      />
    </div>
  );
}
