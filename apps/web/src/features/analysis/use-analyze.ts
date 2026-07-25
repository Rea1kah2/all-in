"use client";

import { useMutation } from "@tanstack/react-query";
import { normalizeAnalyzeResponse } from "@/features/analysis/analyze-adapter";
import { apiFetch } from "@/lib/api";
import {
  type AnalyzeRequest,
  type AnalyzeResponse,
  toWireRequest,
} from "@/types/analysis";

export function useAnalyze() {
  return useMutation<AnalyzeResponse, Error, AnalyzeRequest>({
    mutationFn: async (input) => {
      const raw = await apiFetch<unknown>("/api/analyze", {
        method: "POST",
        body: toWireRequest(input),
      });
      return normalizeAnalyzeResponse(raw);
    },
  });
}
