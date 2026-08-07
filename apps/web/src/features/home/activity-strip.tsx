"use client";

import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowRightIcon, BulbIcon, ListIcon, StarIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { useAnalysisHistory } from "@/features/analysis/use-analysis-history";
import { useProfileStats } from "@/features/profile/use-profile-stats";

const verdictVariant = {
  BUY: "bull",
  HOLD: "hold",
  SELL: "bear",
} as const;

/**
 * Baris paling atas dashboard, menjawab "apa yang terjadi sejak terakhir saya
 * buka" sebelum pengguna menggulir ke data pasar. Datanya dari endpoint yang
 * sudah ada, tidak ada panggilan Gemini di sini.
 */
export function ActivityStrip() {
  const history = useAnalysisHistory();
  const stats = useProfileStats();
  const t = useTranslations("home");
  const tVerdict = useTranslations("verdict");
  const format = useFormatter();

  const latest = history.data?.[0];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Link
        href="/history"
        className="group rounded-card border border-line bg-surface p-5 transition-colors hover:border-brass/40"
      >
        <div className="flex items-center gap-2 text-ink-muted">
          <BulbIcon size={15} />
          <p className="text-xs">{t("lastAnalysis")}</p>
        </div>

        {history.isPending ? (
          <div className="mt-2 h-7 w-28 animate-pulse rounded-badge bg-surface-hover" />
        ) : latest ? (
          <div className="mt-1.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg text-ink">{latest.ticker}</span>
              <Badge variant={verdictVariant[latest.result.recommendation]}>
                {tVerdict(`${latest.result.recommendation}.label`)}
              </Badge>
            </div>
            <p className="text-xs text-ink-faint">
              {format.relativeTime(new Date(latest.createdAt))}
            </p>
          </div>
        ) : (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-brass-ink">
            {t("noAnalysisYet")}
            <ArrowRightIcon size={14} />
          </p>
        )}
      </Link>

      <Link
        href="/watchlist"
        className="group rounded-card border border-line bg-surface p-5 transition-colors hover:border-brass/40"
      >
        <div className="flex items-center gap-2 text-ink-muted">
          <StarIcon size={15} />
          <p className="text-xs">{t("trackedStocks")}</p>
        </div>
        {stats.isPending ? (
          <div className="mt-2 h-7 w-12 animate-pulse rounded-badge bg-surface-hover" />
        ) : (
          <p className="mt-1 font-mono text-2xl text-ink">{stats.data?.watchlist ?? 0}</p>
        )}
      </Link>

      <Link
        href="/history"
        className="group rounded-card border border-line bg-surface p-5 transition-colors hover:border-brass/40"
      >
        <div className="flex items-center gap-2 text-ink-muted">
          <ListIcon size={15} />
          <p className="text-xs">{t("totalAnalyses")}</p>
        </div>
        {stats.isPending ? (
          <div className="mt-2 h-7 w-12 animate-pulse rounded-badge bg-surface-hover" />
        ) : (
          <p className="mt-1 font-mono text-2xl text-ink">{stats.data?.analyses ?? 0}</p>
        )}
      </Link>
    </div>
  );
}
