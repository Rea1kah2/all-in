import { z } from "zod";

export const newsCategorySchema = z.enum([
  "tech",
  "chips",
  "macro",
  "auto",
  "retail",
  "crypto",
]);

export type NewsCategory = z.infer<typeof newsCategorySchema>;

export const newsItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  source: z.string(),
  url: z.string(),
  publishedAt: z.string(),
  tickers: z.array(z.string()),
  category: newsCategorySchema,
  body: z.array(z.string()),
});

export type NewsItem = z.infer<typeof newsItemSchema>;

export function newsImagePath(category: NewsCategory) {
  return `/news-images/${category}.jpg`;
}
