"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type ProfileStats = {
  analyses: number;
  watchlist: number;
  alerts: number;
};

export function useProfileStats() {
  return useQuery({
    queryKey: ["profile-stats"],
    queryFn: () => apiFetch<ProfileStats>("/api/profile/stats"),
    staleTime: 60_000,
  });
}
