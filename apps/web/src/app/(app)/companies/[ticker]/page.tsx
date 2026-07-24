"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  BarChartIcon,
  BulbIcon,
  DocumentIcon,
  NewsIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyChart } from "@/features/companies/company-chart";
import { CompanyMetrics } from "@/features/companies/company-metrics";
import { useCompany, useCompanyCandles } from "@/features/companies/use-company";
import { useNews } from "@/features/market/use-market";
import { NewsRow } from "@/features/news/news-row";
import { WatchlistStar } from "@/features/watchlist/watchlist-star";
import { cn, formatPrice } from "@/lib/utils";

function formatChange(change: number, percent: number) {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}, ${sign}${percent.toFixed(2)}%`;
}

export default function CompanyDetailPage() {
  const params = useParams<{ ticker: string }>();
  const t = useTranslations("companies");
  const ticker = params.ticker.toUpperCase();
  const company = useCompany(ticker);
  const candles = useCompanyCandles(ticker);
  const news = useNews(ticker);

  if (company.isPending) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-badge bg-surface" />
        <div className="h-12 w-64 animate-pulse rounded-badge bg-surface" />
      </div>
    );
  }

  if (company.isError || !company.data) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center">
        <p className="text-sm text-ink">{t("notFound", { ticker })}</p>
        <p className="mt-1 text-xs text-ink-muted">{t("notFoundHint")}</p>
      </div>
    );
  }

  const data = company.data;
  const isPositive = data.price.change >= 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-ink-muted">{data.ticker}</span>
            <Badge variant="neutral">{data.exchange}</Badge>
          </div>
          <h1 className="text-3xl text-ink">{data.name}</h1>
          <p className="text-sm text-ink-muted">
            {data.sector}, {data.industry}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-3xl text-ink">
              {formatPrice(data.price.current, data.price.currency)}
            </p>
            <p
              className={cn(
                "mt-1 flex items-center justify-end gap-1.5 font-mono text-sm",
                isPositive ? "text-bull" : "text-bear",
              )}
            >
              {isPositive ? <TrendingUpIcon size={14} /> : <TrendingDownIcon size={14} />}
              {formatChange(data.price.change, data.price.changePercent)}
            </p>
          </div>
          <WatchlistStar ticker={data.ticker} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <DocumentIcon size={16} />
            {t("tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="fundamental">
            <BarChartIcon size={15} />
            {t("tabs.fundamental")}
          </TabsTrigger>
          <TabsTrigger value="news">
            <NewsIcon size={15} />
            {t("tabs.news")}
            {news.data && news.data.length > 0 ? (
              <Badge variant="neutral" numeric className="px-1.5 py-0">
                {news.data.length}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="rounded-card border border-line bg-surface p-4">
            {candles.isPending ? (
              <div className="h-110 w-full animate-pulse rounded-card bg-bg md:h-130" />
            ) : candles.isError || !candles.data ? (
              <div className="flex h-110 items-center justify-center text-center md:h-130">
                <p className="text-sm text-ink-muted">
                  {t("chartError", { ticker: data.ticker })}
                </p>
              </div>
            ) : (
              <CompanyChart candles={candles.data} height={520} />
            )}
          </div>

          <div className="rounded-card border border-line bg-surface p-6">
            <p className="text-sm leading-relaxed text-ink">{data.description}</p>
          </div>

          <CompanyMetrics metrics={data.metrics} />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-brass/40 bg-brass-bg/30 p-6">
            <div className="space-y-1">
              <p className="text-sm text-ink">{t("ctaTitle")}</p>
              <p className="text-xs text-ink-muted">
                {t("ctaBody", { ticker: data.ticker })}
              </p>
            </div>
            <Button asChild variant="signal">
              <Link href={`/analysis?ticker=${data.ticker}`}>
                <BulbIcon size={16} />
                {t("ctaButton")}
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="fundamental">
          <div className="space-y-4">
            <CompanyMetrics metrics={data.metrics} />
            <p className="text-xs text-ink-muted">{t("fundamentalNote")}</p>
          </div>
        </TabsContent>

        <TabsContent value="news">
          {news.isPending ? (
            <div className="space-y-2">
              {[0, 1, 2].map((key) => (
                <div key={key} className="h-14 animate-pulse rounded-badge bg-surface" />
              ))}
            </div>
          ) : news.isError || !news.data || news.data.length === 0 ? (
            <div className="rounded-card border border-line bg-surface p-8 text-center">
              <p className="text-sm text-ink">{t("newsEmpty")}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {t("newsHint", { ticker: data.ticker })}
              </p>
            </div>
          ) : (
            <div className="rounded-card border border-line bg-surface p-2">
              {news.data.map((item) => (
                <NewsRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
