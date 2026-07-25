"use client";

import { useMutation } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { normalizeAnalyzeResponse } from "@/features/analysis/analyze-adapter";
import { apiFetch } from "@/lib/api";
import {
  type AnalyzeRequest,
  type AnalyzeResponse,
  toWireRequest,
} from "@/types/analysis";

export function useAnalyze() {
  const locale = useLocale();

  return useMutation<AnalyzeResponse, Error, AnalyzeRequest>({
    mutationFn: async (input) => {
      const raw = await apiFetch<unknown>("/api/analyze", {
        method: "POST",
        body: toWireRequest(input, locale === "en" ? "en" : "id"),
      });
      return normalizeAnalyzeResponse(raw);
    },
  });
}
