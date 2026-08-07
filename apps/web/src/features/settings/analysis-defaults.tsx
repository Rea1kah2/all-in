"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSession, useUpdateUser } from "@/features/auth/use-auth";
import { cn } from "@/lib/utils";
import type { User } from "@/types/auth";

const riskOptions: Array<User["defaultRiskProfile"]> = [
  "conservative",
  "moderate",
  "aggressive",
];

const goalOptions: Array<User["defaultInvestmentGoal"]> = ["short_term", "long_term"];

/**
 * Label formulir analisis memakai bentuk berbeda dari nilai yang disimpan, jadi
 * kunci terjemahannya dipetakan di sini supaya tidak ada teks yang digandakan.
 */
const riskKey = {
  conservative: "Conservative",
  moderate: "Moderate",
  aggressive: "Aggressive",
} as const;

const goalKey = {
  short_term: "Short Term",
  medium_term: "Long Term",
  long_term: "Long Term",
} as const;

function OptionRow<T extends string>({
  label,
  options,
  value,
  onSelect,
  labelFor,
}: {
  label: string;
  options: T[];
  value: T;
  onSelect: (next: T) => void;
  labelFor: (option: T) => string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-ink">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              "rounded-pill border px-4 py-2 text-sm transition-colors",
              value === option
                ? "border-brass bg-brass-bg text-brass-ink"
                : "border-line text-ink-muted hover:bg-surface-hover hover:text-ink",
            )}
          >
            {labelFor(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AnalysisDefaults() {
  const { data: user } = useSession();
  const updateUser = useUpdateUser();
  const t = useTranslations("analysisDefaults");
  const tAnalysis = useTranslations("analysis");
  const tCommon = useTranslations("common");
  const [saved, setSaved] = useState(false);

  if (!user) {
    return <div className="h-40 animate-pulse rounded-card bg-surface" />;
  }

  const save = (
    patch: Partial<Pick<User, "defaultRiskProfile" | "defaultInvestmentGoal">>,
  ) => {
    setSaved(false);
    updateUser.mutate(patch, { onSuccess: () => setSaved(true) });
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm text-ink">{t("title")}</h2>
        <p className="mt-0.5 text-xs text-ink-muted">{t("subtitle")}</p>
      </div>

      <div className="space-y-5 rounded-card border border-line bg-surface p-6">
        <OptionRow
          label={tAnalysis("riskLabel")}
          options={riskOptions}
          value={user.defaultRiskProfile}
          onSelect={(option) => save({ defaultRiskProfile: option })}
          labelFor={(option) => tAnalysis(`risk.${riskKey[option]}`)}
        />

        <OptionRow
          label={tAnalysis("goalLabel")}
          options={goalOptions}
          value={
            user.defaultInvestmentGoal === "medium_term"
              ? "long_term"
              : user.defaultInvestmentGoal
          }
          onSelect={(option) => save({ defaultInvestmentGoal: option })}
          labelFor={(option) => tAnalysis(`goal.${goalKey[option]}`)}
        />

        {saved ? <p className="text-teal text-xs">{tCommon("saved")}</p> : null}
      </div>
    </section>
  );
}
