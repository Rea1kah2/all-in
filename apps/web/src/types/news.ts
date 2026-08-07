import { z } from "zod";

/**
 * Yahoo hanya menyediakan judul, penerbit, waktu terbit, dan tautan. Isi
 * artikel tidak pernah kita miliki, jadi tidak ada field `body` di sini dan
 * tidak ada halaman detail. Berita menautkan ke sumber aslinya.
 */
export const newsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: z.string(),
  url: z.string(),
  publishedAt: z.string(),
  tickers: z.array(z.string()),
  /** Gambar dari Yahoo, boleh kosong. UI jatuh ke placeholder ikon. */
  image: z.string().nullable(),
});

export type NewsItem = z.infer<typeof newsItemSchema>;
