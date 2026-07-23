import {
  ArrowRightIcon,
  BarChartIcon,
  BellIcon,
  BookIcon,
  BulbIcon,
  CandlestickIcon,
  CheckIcon,
  DocumentIcon,
  GearIcon,
  GridIcon,
  HistoryIcon,
  HomeIcon,
  LogoutIcon,
  NewsIcon,
  PersonIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  TrashIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "@/components/icons";
import { getTranslations } from "next-intl/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const icons = [
  { name: "search", Icon: SearchIcon },
  { name: "star", Icon: StarIcon },
  { name: "bell", Icon: BellIcon },
  { name: "book", Icon: BookIcon },
  { name: "document", Icon: DocumentIcon },
  { name: "bar chart", Icon: BarChartIcon },
  { name: "candlestick", Icon: CandlestickIcon },
  { name: "news", Icon: NewsIcon },
  { name: "arrow right", Icon: ArrowRightIcon },
  { name: "trending up", Icon: TrendingUpIcon },
  { name: "trending down", Icon: TrendingDownIcon },
  { name: "bulb", Icon: BulbIcon },
  { name: "history", Icon: HistoryIcon },
  { name: "gear", Icon: GearIcon },
  { name: "person", Icon: PersonIcon },
  { name: "logout", Icon: LogoutIcon },
  { name: "plus", Icon: PlusIcon },
  { name: "grid", Icon: GridIcon },
  { name: "trash", Icon: TrashIcon },
  { name: "check", Icon: CheckIcon },
  { name: "home", Icon: HomeIcon },
];

export default async function ShowcasePage() {
  const t = await getTranslations("showcase");

  return (
    <main className="min-h-screen px-8 py-12">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl text-ink">{t("title")}</h1>
            <p className="mt-1 text-sm text-ink-muted">{t("subtitle")}</p>
          </div>
          <ThemeToggle />
        </header>

        <section className="space-y-3">
          <h2 className="text-sm text-ink-muted">{t("iconCatalog")}</h2>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {icons.map(({ name, Icon }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface p-4 text-ink-muted transition-colors hover:text-ink"
              >
                <Icon size={22} />
                <p className="font-mono text-[10px]">{name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm text-ink-muted">{t("iconsInButton")}</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">
              <PlusIcon size={16} />
              {t("addWatchlist")}
            </Button>
            <Button variant="signal">
              <BulbIcon size={16} />
              {t("analyzeWithAi")}
            </Button>
            <Button variant="secondary">
              {t("viewDetail")}
              <ArrowRightIcon size={16} />
            </Button>
            <Button variant="destructive">
              <TrashIcon size={16} />
              {t("remove")}
            </Button>
            <Button variant="ghost" size="icon" aria-label={t("reanalyze")}>
              <HistoryIcon size={18} />
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm text-ink-muted">{t("iconsInBadge")}</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="bull" numeric>
              <TrendingUpIcon size={12} />
              +2.34%
            </Badge>
            <Badge variant="bear" numeric>
              <TrendingDownIcon size={12} />
              -1.87%
            </Badge>
            <Badge variant="signal">
              <BulbIcon size={12} />
              {t("aiSignal")}
            </Badge>
            <Badge variant="neutral">
              <CheckIcon size={12} />
              {t("analyzed")}
            </Badge>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm text-ink-muted">Ukuran ikon</h2>
          <div className="flex items-center gap-6 rounded-card border border-line bg-surface p-5 text-ink-muted">
            <div className="flex flex-col items-center gap-2">
              <StarIcon size={14} />
              <p className="font-mono text-[10px]">14px</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StarIcon size={18} />
              <p className="font-mono text-[10px]">18px</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StarIcon size={22} />
              <p className="font-mono text-[10px]">22px</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StarIcon size={32} />
              <p className="font-mono text-[10px]">32px</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StarIcon size={48} />
              <p className="font-mono text-[10px]">48px</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
