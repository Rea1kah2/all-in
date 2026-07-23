import { defaultLocale, type Locale } from "@/i18n/config";

export function mockLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  for (const entry of document.cookie.split("; ")) {
    const [name, value] = entry.split("=");
    if (name === "locale" && (value === "en" || value === "id")) return value;
  }
  return defaultLocale;
}

export const companyDescriptionsId: Record<string, string> = {
  AAPL: "Apple Inc. adalah perusahaan teknologi multinasional Amerika yang merancang, memproduksi, dan memasarkan elektronik konsumen, perangkat lunak, serta layanan daring.",
  MSFT: "Microsoft Corporation adalah perusahaan teknologi multinasional Amerika yang mengembangkan dan menjual perangkat lunak, layanan awan, serta perangkat komputasi.",
  GOOGL:
    "Alphabet Inc. adalah konglomerat multinasional Amerika yang menjadi induk Google dan sejumlah anak usaha teknologi lainnya.",
  AMZN: "Amazon.com, Inc. adalah perusahaan teknologi multinasional Amerika yang berfokus pada e-commerce, komputasi awan, streaming digital, dan kecerdasan buatan.",
  TSLA: "Tesla, Inc. adalah perusahaan kendaraan listrik dan energi bersih Amerika yang merancang serta menjual mobil listrik, penyimpanan energi, dan produk surya.",
  NVDA: "NVIDIA Corporation adalah perusahaan teknologi Amerika yang merancang unit pemroses grafis untuk gaming, pusat data, dan komputasi kecerdasan buatan.",
  META: "Meta Platforms, Inc. adalah perusahaan teknologi multinasional Amerika yang mengoperasikan Facebook, Instagram, dan layanan sosial lainnya.",
  "BRK.B":
    "Berkshire Hathaway Inc. adalah konglomerat induk multinasional Amerika yang mengawasi dan mengelola banyak perusahaan anak di berbagai sektor.",
  JPM: "JPMorgan Chase & Co. adalah bank investasi dan perusahaan jasa keuangan multinasional Amerika yang berkantor pusat di New York.",
  JNJ: "Johnson & Johnson adalah korporasi multinasional Amerika yang mengembangkan alat kesehatan, farmasi, dan produk konsumen.",
  MSTR: "MicroStrategy Incorporated adalah perusahaan Amerika yang menyediakan perangkat lunak business intelligence, aplikasi mobile, dan layanan berbasis awan.",
  NFLX: "Netflix, Inc. adalah layanan streaming berlangganan dan rumah produksi Amerika yang menyajikan film serta serial dalam beragam genre dan bahasa.",
  AMD: "Advanced Micro Devices, Inc. adalah perusahaan semikonduktor Amerika yang merancang prosesor dan teknologi grafis untuk pusat data, gaming, dan sistem tertanam.",
  DIS: "The Walt Disney Company adalah konglomerat media dan hiburan multinasional Amerika yang mencakup studio, streaming, taman hiburan, dan produk konsumen.",
  COIN: "Coinbase Global, Inc. adalah perusahaan Amerika yang mengoperasikan platform untuk membeli, menjual, dan menyimpan kripto bagi pengguna ritel maupun institusi.",
  PLTR: "Palantir Technologies Inc. adalah perusahaan Amerika yang membangun platform perangkat lunak untuk integrasi dan analisis data bagi pemerintah dan korporasi.",
  UBER: "Uber Technologies, Inc. adalah perusahaan Amerika yang mengoperasikan platform transportasi daring, pengantaran makanan, dan logistik barang di berbagai negara.",
  RKLB: "Rocket Lab USA, Inc. adalah perusahaan antariksa Amerika yang menyediakan layanan peluncuran dan sistem antariksa untuk satelit kecil serta misi pemerintah.",
  KO: "The Coca-Cola Company adalah korporasi minuman multinasional Amerika yang memproduksi dan memasarkan minuman nonalkohol serta sirup di seluruh dunia.",
  SHOP: "Shopify Inc. adalah perusahaan Kanada yang menyediakan platform perdagangan bagi pedagang untuk membangun toko daring dan mengelola penjualan lintas kanal.",
  INTC: "Intel Corporation adalah perusahaan semikonduktor Amerika yang merancang dan memproduksi prosesor, chipset, serta teknologi terkait untuk perangkat komputasi.",
};

export const newsEn: Record<number, { title: string; source: string }> = {
  1: {
    title: "Apple accelerates its AI chip roadmap for next generation devices",
    source: "Market Wire",
  },
  2: {
    title: "NVIDIA expands data center supply as AI compute demand grows",
    source: "Tech Daily",
  },
  3: {
    title: "Microsoft reports Azure growth holding strong this quarter",
    source: "Finance Post",
  },
  4: {
    title: "The Fed holds rates steady, markets respond cautiously",
    source: "Macro Brief",
  },
  5: {
    title: "Amazon reshapes its logistics network to cut delivery costs",
    source: "Retail Signal",
  },
  6: {
    title: "Alphabet expands AI integration across its search product line",
    source: "Tech Daily",
  },
  7: {
    title: "Tesla ramps up battery plant production ahead of next quarter",
    source: "Auto Wire",
  },
  8: {
    title: "Meta unveils new generative AI advertising tools",
    source: "Market Wire",
  },
  9: {
    title: "Palantir wins new government contract for data analytics",
    source: "Gov Tech Brief",
  },
  10: {
    title: "Coinbase sees trading volume surge amid crypto rally",
    source: "Crypto Ledger",
  },
  11: {
    title: "Intel begins production on latest chip node at Arizona fab",
    source: "Tech Daily",
  },
};
