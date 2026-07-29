import { NextResponse } from "next/server";
import { fetchYahooCandles } from "@/lib/yahoo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const ticker = decodeURIComponent((await params).ticker).toUpperCase();

  try {
    const candles = await fetchYahooCandles(ticker);
    if (candles.length === 0) {
      return NextResponse.json(
        { message: `Data harga ${ticker} tidak tersedia` },
        { status: 404 },
      );
    }
    return NextResponse.json(candles);
  } catch (error) {
    console.error(`Gagal mengambil candle ${ticker}`, error);
    return NextResponse.json(
      { message: `Data harga ${ticker} tidak tersedia` },
      { status: 404 },
    );
  }
}
