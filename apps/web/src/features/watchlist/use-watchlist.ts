"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { AddWatchlistInput, WatchlistItem } from "@/types/watchlist";

const watchlistKey = ["watchlist"] as const;

export function useWatchlist() {
  return useQuery({
    queryKey: watchlistKey,
    queryFn: () => apiFetch<WatchlistItem[]>("/api/watchlist"),
    staleTime: 60_000,
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddWatchlistInput) =>
      apiFetch<WatchlistItem>("/api/watchlist", { method: "POST", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: watchlistKey }),
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/watchlist/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: watchlistKey }),
  });
}
