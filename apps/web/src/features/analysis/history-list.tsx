"use client";

import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { ArrowLeftIcon, BulbIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalysisResult } from "@/features/analysis/analysis-result";
import {
  type AnalysisHistoryEntry,
  useAnalysisHistory,
} from "@/features/analysis/use-analysis-history";

const verdictTone = {
  BUY: "bull",
  HOLD: "hold",
  SELL: "bear",
} as const;

function HistoryRow({
  entry,
  onOpen,
}: {
  entry: AnalysisHistoryEntry;
  onOpen: () => void;
}) {
  const t = useTranslations("verdict");
  const format = useFormatter();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-4 rounded-badge p-3 text-left transition-colors hover:bg-surface-hover"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-ink">{entry.ticker}</span>
          <span className="truncate text-xs text-ink-muted">
            {entry.result.company_name}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-faint">
          {format.dateTime(new Date(entry.createdAt), {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="font-mono text-xs text-ink-muted">
          {entry.result.confidence}%
        </span>
        <Badge variant={verdictTone[entry.result.recommendation]}>
          {t(`${entry.result.recommendation}.label`)}
        </Badge>
      </div>
    </button>
  );
}

export function HistoryList() {
  const history = useAnalysisHistory();
  const t = useTranslations("history");
  const [openId, setOpenId] = useState<number | null>(null);

  if (history.isPending) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="h-16 animate-pulse rounded-card bg-surface" />
        ))}
      </div>
    );
  }

  if (history.isError) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center">
        <p className="text-sm text-ink-muted">{t("error")}</p>
      </div>
    );
  }

  const items = history.data ?? [];
  const open = items.find((item) => item.id === openId);

  if (open) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpenId(null)}>
            <ArrowLeftIcon size={16} />
            {t("back")}
          </Button>
          {/*
            Dibuka dari database, bukan dari Gemini. Dinyatakan terang di UI
            supaya pengguna tahu membuka riwayat tidak memakan jatah hariannya.
          */}
          <p className="text-xs text-ink-faint">{t("noCost")}</p>
        </div>

        <AnalysisResult
          result={open.result}
          ticker={open.ticker}
          companyName={open.result.company_name ?? open.ticker}
          onReset={() => setOpenId(null)}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-line bg-surface p-10 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-brass-bg text-brass-ink">
          <BulbIcon size={20} />
        </span>
        <p className="mt-4 text-sm text-ink">{t("empty")}</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
          {t("emptyBody")}
        </p>
        <Button asChild className="mt-5">
          <Link href="/analysis">{t("startAnalysis")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-surface p-2">
      {items.map((entry) => (
        <HistoryRow key={entry.id} entry={entry} onOpen={() => setOpenId(entry.id)} />
      ))}
    </div>
  );
}
