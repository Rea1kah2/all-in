"use client";

import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import type { Candle } from "@/types/company";

const themes = {
  light: {
    background: "#f5f6f4",
    text: "#5f5e5a",
    line: "#e4e7e2",
    bull: "#1e8e63",
    bear: "#d64545",
  },
  dark: {
    background: "#17181c",
    text: "#8a8d93",
    line: "#2a2c31",
    bull: "#3aae7e",
    bear: "#e1584a",
  },
};

export function CompanyChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const palette = themes[resolvedTheme === "dark" ? "dark" : "light"];

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: palette.background },
        textColor: palette.text,
        fontFamily: "var(--font-plex-mono)",
        fontSize: 11,
      },
      grid: {
        horzLines: { color: palette.line },
        vertLines: { color: palette.line },
      },
      rightPriceScale: { borderColor: palette.line },
      timeScale: { borderColor: palette.line, timeVisible: false },
      crosshair: { mode: 1 },
      autoSize: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: palette.bull,
      downColor: palette.bear,
      wickUpColor: palette.bull,
      wickDownColor: palette.bear,
      borderVisible: false,
    });

    series.setData(
      candles.map((candle) => ({
        time: candle.time as never,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })),
    );

    chart.timeScale().fitContent();
    chartRef.current = chart;

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, resolvedTheme]);

  return <div ref={containerRef} className="h-[420px] w-full" />;
}
