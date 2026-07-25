import { Router } from "express";
import { env, geminiModels } from "../lib/env.ts";
import { geminiBudget } from "../lib/gemini-client.ts";

export const healthRouter = Router();

healthRouter.get("/health", (_request, response) => {
  const budget = geminiBudget.snapshot();

  response.json({
    status: "ok",
    service: "all-in-backend",
    model: env.GEMINI_MODEL,
    time: new Date().toISOString(),
    quota: {
      pacificDate: budget.date,
      dailyLimitPerModel: budget.limit,
      models: geminiModels.map((model) => ({
        model,
        used: geminiBudget.used(model),
        remaining: geminiBudget.remaining(model),
      })),
    },
  });
});
