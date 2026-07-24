"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  BarChartIcon,
  BulbIcon,
  CheckIcon,
  NewsIcon,
  SearchIcon,
  TrendingUpIcon,
} from "@/components/icons";
import { Sparkline } from "@/components/ui/sparkline";

const agents = [
  { key: "collector", Icon: SearchIcon },
  { key: "agent1", Icon: BarChartIcon },
  { key: "agent2", Icon: NewsIcon },
  { key: "agent3", Icon: BulbIcon },
];

const spark = [180.1, 181.3, 180.8, 182.4, 183.0, 182.6, 183.9, 184.32];
const TARGET_CONFIDENCE = 89;

export function HeroDemoCard() {
  const t = useTranslations("landing");
  const [done, setDone] = useState(0);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    const timers = agents.map((_, index) =>
      setTimeout(() => setDone(index + 1), 500 + index * 450),
    );
    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (done < agents.length) return;
    const interval = setInterval(() => {
      setConfidence((current) => {
        if (current >= TARGET_CONFIDENCE) {
          clearInterval(interval);
          return TARGET_CONFIDENCE;
        }
        return current + 1;
      });
    }, 18);
    return () => clearInterval(interval);
  }, [done]);

  return (
    <div className="rounded-card border border-line bg-surface p-6 md:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm text-ink">AAPL</span>
          <span className="font-mono text-xs text-ink-faint">184.32</span>
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-bull opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-bull" />
          </span>
        </div>
        <Sparkline data={spark} width={72} height={22} className="text-bull" />
      </div>

      <div className="mt-6 space-y-1">
        {agents.map(({ key, Icon }, index) => {
          const complete = index < done;
          return (
            <div
              key={key}
              className="flex animate-stagger gap-4"
              style={{ animationDelay: `${index * 300}ms` }}
            >
              <div className="flex flex-col items-center">
                <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-brass bg-brass-bg text-brass-ink">
                  <Icon size={15} />
                  {complete ? (
                    <span className="-right-0.5 -bottom-0.5 absolute flex size-3.5 items-center justify-center rounded-full border border-surface bg-bull text-white">
                      <CheckIcon size={9} />
                    </span>
                  ) : null}
                </span>
                {index < agents.length - 1 ? (
                  <span className="w-px flex-1 bg-brass/35" />
                ) : null}
              </div>
              <div className="pb-6">
                <p className="text-sm text-ink">{t(`agents.${key}Name`)}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {t(`agents.${key}Role`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between rounded-badge bg-bull-bg px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUpIcon size={16} className="text-bull" />
          <span className="text-sm text-bull">{t("demoVerdict")}</span>
        </div>
        <span className="font-mono text-lg text-bull">{confidence}%</span>
      </div>
    </div>
  );
}
