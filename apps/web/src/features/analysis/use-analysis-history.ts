"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { AnalyzeResponse } from "@/types/analysis";

export type AnalysisHistoryEntry = {
  id: number;
  ticker: string;
  riskProfile: string;
  investmentGoal: string;
  locale: string;
  createdAt: string;
  result: AnalyzeResponse;
};

/**
 * Riwayat analisis milik pengguna, tidak pernah memanggil Gemini. Dipakai
 * untuk mengembalikan hasil terakhir setelah halaman di-refresh, sesuatu
 * yang sebelumnya mustahil karena hasil hanya hidup di useState.
 */
export function useAnalysisHistory() {
  return useQuery({
    queryKey: ["analysis-history"],
    queryFn: () => apiFetch<AnalysisHistoryEntry[]>("/api/analyze/history"),
    staleTime: 60_000,
    retry: false,
  });
}
