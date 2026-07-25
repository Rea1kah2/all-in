"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  BarChartIcon,
  BulbIcon,
  CheckIcon,
  NewsIcon,
  SearchIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Detik saat tiap tahap mulai aktif. Diturunkan dari latensi nyata pipeline,
 * sekitar 12 detik: pengumpulan data cepat, dua agent pertama jalan paralel,
 * Decision Agent memakan porsi terbesar. Tahap terakhir tidak pernah menandai
 * dirinya selesai, dia menunggu respons benar benar datang.
 */
const STAGE_START_SECONDS = [0, 3, 6, 9];

const stageIcons = [SearchIcon, BarChartIcon, NewsIcon, BulbIcon];

export function AnalysisLoading({ ticker }: { ticker: string }) {
  const t = useTranslations("analysis");
  const tTrail = useTranslations("analysis.trail");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stages = [
    tTrail("collectorTitle"),
    tTrail("agent1Title"),
    tTrail("agent2Title"),
    tTrail("agent3Title"),
  ];

  const activeIndex = STAGE_START_SECONDS.reduce(
    (current, startsAt, index) => (elapsed >= startsAt ? index : current),
    0,
  );

  return (
    <div className="rounded-card border border-line bg-surface p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-ink">{t("loadingTitle", { ticker })}</p>
        <p className="shrink-0 font-mono text-xs tabular-nums text-ink-muted">
          {t("loadingElapsed", { seconds: elapsed })}
        </p>
      </div>
      <p className="mt-1 text-xs text-ink-muted">{t("loadingBody")}</p>

      <div className="mt-7">
        {stages.map((label, index) => {
          const Icon = stageIcons[index] ?? SearchIcon;
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <div key={label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "relative flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                    isDone || isActive
                      ? "border-brass bg-brass-bg text-brass-ink"
                      : "border-line bg-bg text-ink-muted",
                    isActive && "animate-pulse",
                  )}
                >
                  <Icon size={15} />
                  {isDone ? (
                    <span className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full border border-surface bg-bull text-white">
                      <CheckIcon size={10} />
                    </span>
                  ) : null}
                </span>
                {index < stages.length - 1 ? (
                  <span
                    className={cn(
                      "w-px flex-1 transition-colors",
                      isDone ? "bg-brass/35" : "bg-line",
                    )}
                  />
                ) : null}
              </div>

              <div className="pb-8">
                <p
                  className={cn(
                    "text-sm transition-colors",
                    isDone || isActive ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {label}
                </p>
                {isActive ? (
                  <p className="mt-1 text-xs text-brass-ink">{t("loadingStageActive")}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
