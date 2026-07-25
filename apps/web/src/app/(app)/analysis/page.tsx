"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AnalysisForm } from "@/features/analysis/analysis-form";
import { AnalysisLoading } from "@/features/analysis/analysis-loading";
import { AnalysisResult } from "@/features/analysis/analysis-result";
import { useAnalyze } from "@/features/analysis/use-analyze";
import { useCompany } from "@/features/companies/use-company";
import { ApiError } from "@/lib/api";
import type { AnalyzeRequest, AnalyzeResponse } from "@/types/analysis";

type ResultState = {
  data: AnalyzeResponse;
  ticker: string;
};

const knownErrorCodes = [
  "ticker_not_found",
  "market_data_unavailable",
  "ai_unavailable",
  "rate_limited",
  "network_error",
] as const;

function errorMessageKey(error: unknown): string | null {
  if (!(error instanceof ApiError) || !error.code) {
    return null;
  }
  return knownErrorCodes.some((code) => code === error.code)
    ? `errors.${error.code}`
    : null;
}

export default function AnalysisPage() {
  const params = useSearchParams();
  const router = useRouter();
  const defaultTicker = params.get("ticker")?.toUpperCase() ?? undefined;

  const t = useTranslations("analysis");
  const [result, setResult] = useState<ResultState | null>(null);
  const analyze = useAnalyze();
  const company = useCompany(result?.ticker ?? "");

  const errorKey = errorMessageKey(analyze.error);
  const errorMessage = errorKey ? t(errorKey) : t("failed");

  const handleSubmit = (values: AnalyzeRequest) => {
    analyze.mutate(values, {
      onSuccess: (data) => setResult({ data, ticker: values.ticker }),
    });
  };

  const handleReset = () => {
    setResult(null);
    analyze.reset();
    router.replace("/analysis");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      {result ? (
        <AnalysisResult
          result={result.data}
          ticker={result.ticker}
          companyName={company.data?.name ?? result.ticker}
          onReset={handleReset}
        />
      ) : analyze.isPending ? (
        <AnalysisLoading ticker={analyze.variables?.ticker ?? ""} />
      ) : (
        <div className="rounded-card border border-line bg-surface p-6 md:p-8">
          <AnalysisForm
            defaultTicker={defaultTicker}
            isPending={analyze.isPending}
            onSubmit={handleSubmit}
          />

          {analyze.isError ? (
            <p className="mt-4 rounded-badge bg-bear-bg px-3 py-2 text-xs text-bear">
              {errorMessage}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
