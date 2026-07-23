"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { BellIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn, formatPrice } from "@/lib/utils";
import type { AlertCondition, PriceAlert } from "@/types/alert";
import { useRemoveAlert, useSetAlert } from "./use-alerts";

type Props = {
  ticker: string;
  price: number;
  currency: string;
  alert?: PriceAlert;
};

const conditions: AlertCondition[] = ["above", "below"];

export function PriceAlertDialog({ ticker, price, currency, alert }: Props) {
  const t = useTranslations("alert");
  const tActions = useTranslations("watchlist.actions");
  const set = useSetAlert();
  const removeAlert = useRemoveAlert();

  const [open, setOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<AlertCondition>("above");

  useEffect(() => {
    if (open) {
      setTargetPrice(String(alert?.targetPrice ?? price.toFixed(2)));
      setCondition(alert?.condition ?? "above");
    }
  }, [open, alert, price]);

  const hasAlert = Boolean(alert);
  const value = Number(targetPrice);
  const isValid = Number.isFinite(value) && value > 0;

  const save = () => {
    if (!isValid) return;
    set.mutate(
      { ticker, targetPrice: value, condition },
      { onSuccess: () => setOpen(false) },
    );
  };

  const remove = () => {
    removeAlert.mutate(ticker, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={hasAlert ? t("active") : tActions("alert")}
          title={hasAlert ? t("active") : tActions("alert")}
          className="relative"
        >
          <BellIcon
            size={18}
            className={hasAlert ? "fill-current text-teal" : undefined}
          />
          {hasAlert ? (
            <span className="absolute top-1 right-1 size-1.5 rounded-full bg-teal" />
          ) : null}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription>{t("description", { ticker })}</DialogDescription>

        <div className="mt-5 space-y-4">
          <Field label={t("targetPrice")} htmlFor="alert-price">
            <Input
              id="alert-price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={targetPrice}
              onChange={(event) => setTargetPrice(event.target.value)}
              className="font-mono"
            />
          </Field>

          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-2">
              {conditions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCondition(option)}
                  className={cn(
                    "rounded-pill border px-3.5 py-2 text-xs transition-colors",
                    condition === option
                      ? "border-teal bg-surface-hover text-teal"
                      : "border-line text-ink-muted hover:bg-surface-hover hover:text-ink",
                  )}
                >
                  {t(option)}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-faint">
              {t("current", { price: formatPrice(price, currency) })}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          {hasAlert ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={remove}
              loading={removeAlert.isPending}
              className="mr-auto text-bear hover:bg-bear-bg hover:text-bear"
            >
              {t("remove")}
            </Button>
          ) : null}
          <Button
            variant="primary"
            size="sm"
            onClick={save}
            disabled={!isValid}
            loading={set.isPending}
          >
            {t("save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
