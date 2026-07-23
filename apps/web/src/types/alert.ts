import { z } from "zod";

export const alertConditionSchema = z.enum(["above", "below"]);

export type AlertCondition = z.infer<typeof alertConditionSchema>;

export const priceAlertSchema = z.object({
  ticker: z.string(),
  targetPrice: z.number().positive(),
  condition: alertConditionSchema,
});

export type PriceAlert = z.infer<typeof priceAlertSchema>;

export const setAlertSchema = z.object({
  targetPrice: z.number().positive(),
  condition: alertConditionSchema,
});

export type SetAlertInput = z.infer<typeof setAlertSchema>;
