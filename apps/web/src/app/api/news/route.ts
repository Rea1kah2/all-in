import { NextResponse } from "next/server";
import { fetchYahooNews } from "@/lib/yahoo";
import type { NewsItem } from "@/types/news";

export async function GET(request: Request) {
  const ticker = new URL(request.url).searchParams.get("ticker") ?? undefined;

  try {
    const headlines = await fetchYahooNews(ticker ?? undefined);
    const items: NewsItem[] = headlines.map((headline) => ({
      id: headline.id,
      title: headline.title,
      source: headline.source,
      url: headline.url,
      publishedAt: headline.publishedAt,
      tickers: headline.tickers,
    }));
    return NextResponse.json(items);
  } catch (error) {
    console.error("Gagal mengambil berita", error);
    return NextResponse.json(
      { message: "Berita sedang tidak tersedia" },
      { status: 502 },
    );
  }
}
