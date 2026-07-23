"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { AnalyzeRequest, AnalyzeResponse } from "@/types/analysis";

export function useAnalyze() {
  return useMutation({
    mutationFn: (input: AnalyzeRequest) =>
      apiFetch<AnalyzeResponse>("/api/analyze", {
        method: "POST",
        body: input,
      }),
  });
}
