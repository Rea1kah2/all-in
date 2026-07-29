"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { MarketSummary } from "@/types/market";
import type { NewsItem } from "@/types/news";

export function useMarket() {
  return useQuery({
    queryKey: ["market"],
    queryFn: () => apiFetch<MarketSummary>("/api/market"),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useNews(ticker?: string) {
  return useQuery({
    queryKey: ["news", ticker ?? "all"],
    queryFn: () =>
      apiFetch<NewsItem[]>(ticker ? `/api/news?ticker=${ticker}` : "/api/news"),
    staleTime: 5 * 60_000,
  });
}
