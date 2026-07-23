"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Candle, Company } from "@/types/company";

export function useCompany(ticker: string) {
  const normalized = ticker.toUpperCase();
  return useQuery({
    queryKey: ["company", normalized],
    queryFn: () => apiFetch<Company>(`/api/company/${normalized}`),
    staleTime: 60_000,
    enabled: normalized.length > 0,
  });
}

export function useCompanyCandles(ticker: string) {
  const normalized = ticker.toUpperCase();
  return useQuery({
    queryKey: ["company", normalized, "candles"],
    queryFn: () => apiFetch<Candle[]>(`/api/company/${normalized}/candles`),
    staleTime: 5 * 60_000,
    enabled: normalized.length > 0,
  });
}
