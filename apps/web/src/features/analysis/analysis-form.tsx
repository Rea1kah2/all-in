"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { BulbIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type AnalyzeRequest, analyzeRequestSchema } from "@/types/analysis";

const riskOptions: Array<AnalyzeRequest["risk_profile"]> = [
  "Conservative",
  "Moderate",
  "Aggressive",
];

const goalOptions: Array<AnalyzeRequest["investment_goal"]> = ["Short Term", "Long Term"];

type Props = {
  defaultTicker?: string;
  isPending: boolean;
  onSubmit: (values: AnalyzeRequest) => void;
};

export function AnalysisForm({ defaultTicker, isPending, onSubmit }: Props) {
  const t = useTranslations("analysis");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AnalyzeRequest>({
    resolver: zodResolver(analyzeRequestSchema),
    defaultValues: {
      ticker: defaultTicker ?? "",
      market: "US",
      risk_profile: "Moderate",
      investment_goal: "Long Term",
    },
  });

  const submit = handleSubmit((values) => {
    onSubmit({ ...values, ticker: values.ticker.toUpperCase() });
  });

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <Field label={t("tickerLabel")} htmlFor="ticker" error={errors.ticker?.message}>
        <Input
          id="ticker"
          placeholder={t("tickerPlaceholder")}
          autoComplete="off"
          spellCheck={false}
          className="uppercase"
          aria-invalid={Boolean(errors.ticker)}
          {...register("ticker")}
        />
      </Field>

      <Controller
        control={control}
        name="risk_profile"
        render={({ field }) => (
          <div className="space-y-1.5">
            <p className="text-sm text-ink">{t("riskLabel")}</p>
            <div className="flex flex-wrap gap-2">
              {riskOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => field.onChange(option)}
                  className={cn(
                    "rounded-pill border px-4 py-2 text-sm transition-colors",
                    field.value === option
                      ? "border-brass bg-brass-bg text-brass-ink"
                      : "border-line text-ink-muted hover:bg-surface-hover hover:text-ink",
                  )}
                >
                  {t(`risk.${option}`)}
                </button>
              ))}
            </div>
          </div>
        )}
      />

      <Controller
        control={control}
        name="investment_goal"
        render={({ field }) => (
          <div className="space-y-1.5">
            <p className="text-sm text-ink">{t("goalLabel")}</p>
            <div className="flex flex-wrap gap-2">
              {goalOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => field.onChange(option)}
                  className={cn(
                    "rounded-pill border px-4 py-2 text-sm transition-colors",
                    field.value === option
                      ? "border-brass bg-brass-bg text-brass-ink"
                      : "border-line text-ink-muted hover:bg-surface-hover hover:text-ink",
                  )}
                >
                  {t(`goal.${option}`)}
                </button>
              ))}
            </div>
          </div>
        )}
      />

      <Button
        type="submit"
        variant="signal"
        size="lg"
        loading={isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? null : <BulbIcon size={16} />}
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
