import { z } from "zod";
import { priceSchema } from "@/types/company";

export const watchlistRecommendationSchema = z.enum(["BUY", "HOLD", "SELL"]);

export const watchlistItemSchema = z.object({
  id: z.number(),
  ticker: z.string(),
  name: z.string(),
  price: priceSchema,
  recommendation: watchlistRecommendationSchema.nullable(),
  confidence: z.number().min(0).max(100).nullable(),
  addedAt: z.string(),
});

export type WatchlistItem = z.infer<typeof watchlistItemSchema>;

export const addWatchlistSchema = z.object({
  ticker: z.string().min(1),
  recommendation: watchlistRecommendationSchema.nullable().optional(),
  confidence: z.number().min(0).max(100).nullable().optional(),
});

export type AddWatchlistInput = z.infer<typeof addWatchlistSchema>;
