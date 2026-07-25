import { Router } from "express";
import { env } from "../lib/env.ts";

export const healthRouter = Router();

healthRouter.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "all-in-backend",
    model: env.GEMINI_MODEL,
    time: new Date().toISOString(),
  });
});
