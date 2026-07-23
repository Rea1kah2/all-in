import type { ComponentType } from "react";
import { z } from "zod";
import {
  BarChartIcon,
  BellIcon,
  CandlestickIcon,
  type IconProps,
  PersonIcon,
} from "@/components/icons";
import { categoriesEn, glossaryEn } from "@/config/learn-en";

export const learnCategorySlugSchema = z.enum([
  "fundamental",
  "technical",
  "risk",
  "psychology",
]);

export type LearnCategorySlug = z.infer<typeof learnCategorySlugSchema>;

export type LearnCategory = {
  slug: LearnCategorySlug;
  title: string;
  description: string;
  Icon: ComponentType<IconProps>;
};

export const learnCategories: LearnCategory[] = [
  {
    slug: "fundamental",
    title: "Fundamental",
    description: "Menilai kesehatan bisnis, valuasi, dan angka di balik sebuah saham.",
    Icon: BarChartIcon,
  },
  {
    slug: "technical",
    title: "Technical dan SMC",
    description:
      "Membaca struktur harga dan momentum, termasuk kerangka Smart Money Concept.",
    Icon: CandlestickIcon,
  },
  {
    slug: "risk",
    title: "Manajemen Risiko",
    description: "Menjaga modal lewat ukuran posisi, stop loss, dan diversifikasi.",
    Icon: BellIcon,
  },
  {
    slug: "psychology",
    title: "Psikologi Investasi",
    description: "Mengelola emosi dan bias yang memengaruhi keputusan investasi.",
    Icon: PersonIcon,
  },
];

export const glossaryTermSchema = z.object({
  slug: z.string(),
  term: z.string(),
  aliases: z.array(z.string()),
  category: learnCategorySlugSchema,
  short: z.string(),
});

export type GlossaryTerm = z.infer<typeof glossaryTermSchema>;

export const glossary: GlossaryTerm[] = glossaryTermSchema.array().parse([
  {
    slug: "pe-ratio",
    term: "P/E Ratio",
    aliases: ["PER", "Price to Earnings", "Rasio harga terhadap laba"],
    category: "fundamental",
    short:
      "Perbandingan harga saham terhadap laba per saham. Menunjukkan berapa yang dibayar investor untuk setiap satu dolar laba.",
  },
  {
    slug: "roe",
    term: "ROE",
    aliases: ["Return on Equity", "Imbal hasil ekuitas"],
    category: "fundamental",
    short:
      "Return on Equity mengukur seberapa efisien perusahaan menghasilkan laba dari modal pemegang saham. Makin tinggi umumnya makin baik.",
  },
  {
    slug: "eps",
    term: "EPS",
    aliases: ["Earnings per Share", "Laba per saham"],
    category: "fundamental",
    short:
      "Laba bersih perusahaan dibagi jumlah saham beredar, yaitu porsi laba untuk tiap lembar saham.",
  },
  {
    slug: "dividend-yield",
    term: "Dividend Yield",
    aliases: ["Yield dividen", "Imbal hasil dividen"],
    category: "fundamental",
    short:
      "Dividen tahunan dibagi harga saham, dinyatakan dalam persen. Nol atau kosong berarti perusahaan tidak membagikan dividen.",
  },
  {
    slug: "market-cap",
    term: "Market Cap",
    aliases: ["Kapitalisasi pasar", "Market Capitalization"],
    category: "fundamental",
    short:
      "Nilai total seluruh saham perusahaan, dihitung dari harga saham dikali jumlah saham beredar.",
  },
  {
    slug: "debt-to-equity",
    term: "Debt to Equity",
    aliases: ["DER", "Rasio utang terhadap ekuitas"],
    category: "fundamental",
    short:
      "Perbandingan total utang terhadap ekuitas. Rasio tinggi menandakan perusahaan banyak bergantung pada utang.",
  },
  {
    slug: "revenue-growth",
    term: "Pertumbuhan Pendapatan",
    aliases: ["Revenue Growth", "Sales Growth"],
    category: "fundamental",
    short:
      "Laju kenaikan pendapatan dari waktu ke waktu, indikator awal apakah bisnis sedang berkembang atau melambat.",
  },
  {
    slug: "free-cash-flow",
    term: "Free Cash Flow",
    aliases: ["FCF", "Arus kas bebas"],
    category: "fundamental",
    short:
      "Kas yang tersisa setelah biaya operasi dan belanja modal, yaitu uang riil yang bisa dipakai untuk dividen, buyback, atau ekspansi.",
  },
  {
    slug: "support-resistance",
    term: "Support dan Resistance",
    aliases: ["Support", "Resistance", "Level"],
    category: "technical",
    short:
      "Support adalah area harga yang cenderung menahan penurunan, resistance area yang cenderung menahan kenaikan.",
  },
  {
    slug: "trend",
    term: "Trend",
    aliases: ["Uptrend", "Downtrend", "Tren"],
    category: "technical",
    short:
      "Arah dominan pergerakan harga. Uptrend membentuk puncak dan lembah yang makin tinggi, downtrend sebaliknya.",
  },
  {
    slug: "moving-average",
    term: "Moving Average",
    aliases: ["MA", "Rata rata bergerak", "EMA", "SMA"],
    category: "technical",
    short:
      "Garis rata rata harga selama periode tertentu yang memuluskan fluktuasi dan membantu melihat arah tren.",
  },
  {
    slug: "rsi",
    term: "RSI",
    aliases: ["Relative Strength Index"],
    category: "technical",
    short:
      "Relative Strength Index mengukur kecepatan pergerakan harga dari nol sampai seratus, sering dipakai menandai kondisi jenuh beli atau jenuh jual.",
  },
  {
    slug: "volume",
    term: "Volume",
    aliases: ["Volume perdagangan"],
    category: "technical",
    short:
      "Jumlah saham yang diperdagangkan pada periode tertentu. Volume besar menguatkan keyakinan pada sebuah pergerakan harga.",
  },
  {
    slug: "order-block",
    term: "Order Block",
    aliases: ["OB"],
    category: "technical",
    short:
      "Dalam Smart Money Concept, area candle terakhir sebelum pergerakan kuat, dianggap jejak pesanan besar institusi yang bisa menjadi zona reaksi harga.",
  },
  {
    slug: "liquidity",
    term: "Liquidity",
    aliases: ["Likuiditas", "Liquidity pool"],
    category: "technical",
    short:
      "Kumpulan pesanan, sering di sekitar level tinggi atau rendah yang jelas, yang menjadi target harga dalam kerangka Smart Money Concept.",
  },
  {
    slug: "fair-value-gap",
    term: "Fair Value Gap",
    aliases: ["FVG", "Imbalance"],
    category: "technical",
    short:
      "Celah harga akibat pergerakan cepat yang meninggalkan ketidakseimbangan, sering diuji ulang oleh harga sebelum melanjutkan arah.",
  },
  {
    slug: "break-of-structure",
    term: "Break of Structure",
    aliases: ["BOS"],
    category: "technical",
    short:
      "Ketika harga menembus puncak atau lembah penting searah tren, menandakan tren yang sedang berlangsung kemungkinan berlanjut.",
  },
  {
    slug: "change-of-character",
    term: "Change of Character",
    aliases: ["CHoCH"],
    category: "technical",
    short:
      "Sinyal awal pembalikan dalam Smart Money Concept, saat harga menembus struktur berlawanan dengan tren sebelumnya.",
  },
  {
    slug: "premium-discount",
    term: "Premium dan Discount",
    aliases: ["Premium", "Discount", "Equilibrium"],
    category: "technical",
    short:
      "Membagi sebuah rentang harga jadi zona mahal (premium) dan murah (discount) memakai titik tengah, untuk menilai lokasi entry yang lebih baik.",
  },
  {
    slug: "risk-reward",
    term: "Risk Reward Ratio",
    aliases: ["RR", "Rasio risiko imbalan"],
    category: "risk",
    short:
      "Perbandingan potensi kerugian terhadap potensi keuntungan sebuah posisi. Rasio satu banding dua berarti berani rugi satu untuk peluang untung dua.",
  },
  {
    slug: "position-sizing",
    term: "Position Sizing",
    aliases: ["Ukuran posisi", "Sizing"],
    category: "risk",
    short:
      "Menentukan berapa besar modal yang dialokasikan ke satu posisi agar satu kerugian tidak merusak keseluruhan portofolio.",
  },
  {
    slug: "stop-loss",
    term: "Stop Loss",
    aliases: ["SL", "Batas rugi"],
    category: "risk",
    short:
      "Batas harga yang ditetapkan untuk menutup posisi otomatis demi membatasi kerugian saat harga bergerak melawan rencana.",
  },
  {
    slug: "diversification",
    term: "Diversifikasi",
    aliases: ["Diversification"],
    category: "risk",
    short:
      "Menyebar modal ke beberapa saham atau sektor agar penurunan satu aset tidak menghantam seluruh portofolio.",
  },
  {
    slug: "drawdown",
    term: "Drawdown",
    aliases: ["Penurunan puncak ke lembah"],
    category: "risk",
    short:
      "Besar penurunan nilai portofolio dari puncak tertinggi ke titik terendah sebelum pulih, ukuran seberapa dalam kerugian sementara.",
  },
  {
    slug: "fomo",
    term: "FOMO",
    aliases: ["Fear of Missing Out", "Takut ketinggalan"],
    category: "psychology",
    short:
      "Dorongan membeli karena takut ketinggalan kenaikan, sering membuat investor masuk di harga tinggi tanpa analisis.",
  },
  {
    slug: "loss-aversion",
    term: "Loss Aversion",
    aliases: ["Penghindaran kerugian"],
    category: "psychology",
    short:
      "Kecenderungan merasakan sakit kerugian lebih kuat daripada senang keuntungan, kerap membuat investor menahan posisi rugi terlalu lama.",
  },
  {
    slug: "confirmation-bias",
    term: "Confirmation Bias",
    aliases: ["Bias konfirmasi"],
    category: "psychology",
    short:
      "Kecenderungan hanya mencari informasi yang mendukung keyakinan sendiri dan mengabaikan bukti yang bertentangan.",
  },
  {
    slug: "discipline",
    term: "Disiplin",
    aliases: ["Discipline", "Trading plan"],
    category: "psychology",
    short:
      "Mematuhi rencana yang sudah dibuat, termasuk aturan entry, stop loss, dan target, alih alih bertindak berdasarkan emosi sesaat.",
  },
]);

export function findTerm(slugOrAlias: string): GlossaryTerm | undefined {
  const needle = slugOrAlias.toLowerCase();
  return glossary.find(
    (item) =>
      item.slug === needle ||
      item.term.toLowerCase() === needle ||
      item.aliases.some((alias) => alias.toLowerCase() === needle),
  );
}

export function termsByCategory(category: LearnCategorySlug): GlossaryTerm[] {
  return glossary.filter((item) => item.category === category);
}

export function findCategory(slug: string): LearnCategory | undefined {
  return learnCategories.find((category) => category.slug === slug);
}

export function localizedTerm(term: GlossaryTerm, locale: string) {
  const fallback = { term: term.term, short: term.short };
  if (locale !== "en") return fallback;
  return glossaryEn[term.slug] ?? fallback;
}

export function localizedCategory(category: LearnCategory, locale: string) {
  const fallback = { title: category.title, description: category.description };
  if (locale !== "en") return fallback;
  return categoriesEn[category.slug] ?? fallback;
}
