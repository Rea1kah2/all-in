import { NextResponse } from "next/server";
import { fetchYahooProfile, fetchYahooQuote } from "@/lib/yahoo";
import type { Company } from "@/types/company";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const ticker = decodeURIComponent((await params).ticker).toUpperCase();

  let profile: Awaited<ReturnType<typeof fetchYahooProfile>>;
  let quote: Awaited<ReturnType<typeof fetchYahooQuote>>;
  try {
    [profile, quote] = await Promise.all([
      fetchYahooProfile(ticker),
      fetchYahooQuote(ticker),
    ]);
  } catch (error) {
    console.error(`Gagal mengambil profil ${ticker}`, error);
    return NextResponse.json(
      { message: `Saham ${ticker} tidak ditemukan` },
      { status: 404 },
    );
  }

  const company: Company = {
    ticker,
    name: profile.name,
    exchange: profile.exchange,
    sector: profile.sector,
    industry: profile.industry,
    description: profile.description,
    price: {
      current: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      currency: quote.currency,
    },
    metrics: {
      peRatio: profile.peRatio,
      roe: profile.roe,
      debtToEquity: profile.debtToEquity,
      dividendYield: profile.dividendYield,
    },
  };

  return NextResponse.json(company);
}
