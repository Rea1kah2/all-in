"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { PriceAlert, SetAlertInput } from "@/types/alert";

const alertsKey = ["alerts"] as const;

export function useAlerts() {
  return useQuery({
    queryKey: alertsKey,
    queryFn: () => apiFetch<PriceAlert[]>("/api/alerts"),
    staleTime: 60_000,
  });
}

export function useSetAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticker, ...input }: { ticker: string } & SetAlertInput) =>
      apiFetch<PriceAlert>(`/api/alerts/${ticker}`, { method: "PUT", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: alertsKey }),
  });
}

export function useRemoveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticker: string) =>
      apiFetch<void>(`/api/alerts/${ticker}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: alertsKey }),
  });
}
