"use client";

import { useTranslations } from "next-intl";
import { BulbIcon } from "@/components/icons";

export function AnalysisLoading({ ticker }: { ticker: string }) {
  const t = useTranslations("analysis");

  return (
    <div className="rounded-card border border-line bg-surface p-10 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-brass bg-brass-bg text-brass-ink">
        <BulbIcon size={22} />
      </div>
      <p className="mt-6 text-sm text-ink">{t("loadingTitle", { ticker })}</p>
      <p className="mt-2 text-xs text-ink-muted">{t("loadingBody")}</p>
      <div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-bg">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-brass" />
      </div>
    </div>
  );
}
