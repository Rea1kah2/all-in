import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Mata uang yang lazim ditulis tanpa desimal, menulis Rp 6.275,00 terasa keliru. */
const zeroDecimalCurrencies = new Set(["IDR", "JPY", "KRW", "VND"]);

export function formatPrice(value: number, currency: string) {
  const code = currency.toUpperCase();
  const fractionDigits = zeroDecimalCurrencies.has(code) ? 0 : 2;

  return new Intl.NumberFormat(code === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(percent: number) {
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
}

export function relativeTime(iso: string, locale: string) {
  const diffMinutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, "hour");
  return formatter.format(Math.round(diffHours / 24), "day");
}
