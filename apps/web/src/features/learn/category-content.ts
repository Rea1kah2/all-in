import type { ComponentType } from "react";
import type { LearnCategorySlug } from "@/config/learn";
import FundamentalEn from "@/content/learn/en/fundamental.mdx";
import PsychologyEn from "@/content/learn/en/psychology.mdx";
import RiskEn from "@/content/learn/en/risk.mdx";
import TechnicalEn from "@/content/learn/en/technical.mdx";
import FundamentalId from "@/content/learn/id/fundamental.mdx";
import PsychologyId from "@/content/learn/id/psychology.mdx";
import RiskId from "@/content/learn/id/risk.mdx";
import TechnicalId from "@/content/learn/id/technical.mdx";
import type { Locale } from "@/i18n/config";

type ArticleMap = Record<LearnCategorySlug, ComponentType<Record<string, unknown>>>;

export const categoryArticles: Record<Locale, ArticleMap> = {
  id: {
    fundamental: FundamentalId,
    technical: TechnicalId,
    risk: RiskId,
    psychology: PsychologyId,
  },
  en: {
    fundamental: FundamentalEn,
    technical: TechnicalEn,
    risk: RiskEn,
    psychology: PsychologyEn,
  },
};
