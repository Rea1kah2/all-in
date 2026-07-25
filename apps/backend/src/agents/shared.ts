import type { Locale } from "@all-in/contracts";

export const languageInstruction: Record<Locale, string> = {
  id: "Tulis seluruh keluaran teks dalam Bahasa Indonesia yang jelas dan ringkas. Jangan memakai tanda hubung pendek sebagai pemisah frasa.",
  en: "Write every text output in clear and concise English. Do not use short hyphens as phrase separators.",
};

export const analystGuardrails =
  "Kamu adalah bagian dari sistem analisis saham. Kamu hanya menafsirkan angka yang sudah dihitung dan diberikan kepadamu. Jangan mengarang angka baru, jangan menghitung ulang indikator, dan jangan menyebut sumber data yang tidak diberikan. Sampaikan penilaian secara netral dan berbasis bukti, bukan sebagai ajakan membeli atau menjual.";

export function formatPercentFromFraction(value: number | null): string {
  return value === null ? "tidak tersedia" : `${(value * 100).toFixed(2)}%`;
}

export function formatPercentValue(value: number | null): string {
  return value === null ? "tidak tersedia" : `${value.toFixed(2)}%`;
}

export function formatRatio(value: number | null): string {
  return value === null ? "tidak tersedia" : value.toFixed(2);
}

export function formatMoney(value: number | null, currency: string): string {
  if (value === null) return "tidak tersedia";
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)} miliar ${currency}`;
  }
  return `${value.toFixed(2)} ${currency}`;
}

export function riskProfileLabel(profile: string): string {
  const labels: Record<string, string> = {
    conservative: "konservatif",
    moderate: "moderat",
    aggressive: "agresif",
  };
  return labels[profile] ?? profile;
}

export function investmentGoalLabel(goal: string): string {
  const labels: Record<string, string> = {
    short_term: "jangka pendek",
    medium_term: "jangka menengah",
    long_term: "jangka panjang",
  };
  return labels[goal] ?? goal;
}
