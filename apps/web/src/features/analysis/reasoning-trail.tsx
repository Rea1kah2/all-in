"use client";

import { useTranslations } from "next-intl";
import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons";
import {
  BarChartIcon,
  BulbIcon,
  CheckIcon,
  NewsIcon,
  SearchIcon,
} from "@/components/icons";
import type { AnalyzeResponse } from "@/types/analysis";

type TrailStep = {
  title: string;
  role: string;
  output: string;
  Icon: ComponentType<IconProps>;
};

export function ReasoningTrail({ result }: { result: AnalyzeResponse }) {
  const t = useTranslations("analysis");
  const tTrail = useTranslations("analysis.trail");

  const steps: TrailStep[] = [
    {
      title: tTrail("collectorTitle"),
      role: tTrail("collectorRole"),
      output: tTrail("collectorOutput"),
      Icon: SearchIcon,
    },
    {
      title: tTrail("agent1Title"),
      role: tTrail("agent1Role"),
      output: tTrail("agent1Output", {
        fundamental: result.fundamental_score,
        technical: result.technical_score,
      }),
      Icon: BarChartIcon,
    },
    {
      title: tTrail("agent2Title"),
      role: tTrail("agent2Role"),
      output: tTrail("agent2Output", { score: result.market_intelligence_score }),
      Icon: NewsIcon,
    },
    {
      title: tTrail("agent3Title"),
      role: tTrail("agent3Role"),
      output: tTrail("agent3Output", {
        recommendation: result.recommendation,
        confidence: result.confidence,
      }),
      Icon: BulbIcon,
    },
  ];

  return (
    <div className="rounded-card border border-line bg-surface p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2.5">
        <BulbIcon size={16} className="text-brass" />
        <h2 className="text-sm text-ink">{t("trailTitle")}</h2>
      </div>

      <div className="space-y-0">
        {steps.map(({ title, role, output, Icon }, index) => (
          <div
            key={title}
            className="flex gap-4 animate-stagger"
            style={{ animationDelay: `${index * 300}ms` }}
          >
            <div className="flex flex-col items-center">
              <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-brass bg-brass-bg text-brass-ink">
                <Icon size={15} />
                <span className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full border border-surface bg-bull text-white">
                  <CheckIcon size={10} />
                </span>
              </span>
              {index < steps.length - 1 ? (
                <span className="w-px flex-1 bg-brass/35" />
              ) : null}
            </div>

            <div className="pb-8">
              <p className="text-sm text-ink">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{role}</p>
              <p className="mt-2 font-mono text-xs text-brass-ink">{output}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
