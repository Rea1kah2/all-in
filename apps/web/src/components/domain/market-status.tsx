"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { MarketPhase, MarketReading } from "@/lib/market";
import { readMarket } from "@/lib/market";
import { cn } from "@/lib/utils";

const dotStyles: Record<MarketPhase, string> = {
  open: "bg-bull",
  pre: "bg-hold",
  after: "bg-hold",
  closed: "bg-ink-faint",
};

export function MarketStatus() {
  const t = useTranslations("market");
  const [reading, setReading] = useState<MarketReading | null>(null);

  useEffect(() => {
    const update = () => setReading(readMarket(new Date()));
    update();
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!reading) {
    return <div className="h-8 w-36" />;
  }

  return (
    <div className="flex h-8 items-center gap-2 rounded-pill border border-line bg-surface px-3">
      <span className="relative flex size-2">
        {reading.phase === "open" ? (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-bull opacity-60" />
        ) : null}
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            dotStyles[reading.phase],
          )}
        />
      </span>
      <span className="text-xs text-ink-muted">{t(reading.phase)}</span>
      <span className="font-mono text-xs text-ink-faint">{reading.timeLabel}</span>
    </div>
  );
}
