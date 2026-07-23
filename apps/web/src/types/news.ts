import { z } from "zod";

export const newsItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  source: z.string(),
  url: z.string(),
  publishedAt: z.string(),
  tickers: z.array(z.string()),
});

export type NewsItem = z.infer<typeof newsItemSchema>;
