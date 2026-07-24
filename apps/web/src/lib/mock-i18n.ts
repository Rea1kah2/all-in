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

export const newsEn: Record<number, { title: string; source: string; body: string[] }> = {
  1: {
    title: "Apple accelerates its AI chip roadmap for next generation devices",
    source: "Market Wire",
    body: [
      "Apple is reportedly accelerating development of dedicated AI silicon for its next generation devices. The move signals an effort to reduce reliance on third party suppliers and bring AI processing directly onto user devices.",
      "Analysts see the in house silicon strategy strengthening long term margins and speeding up new AI features. Investors will watch whether this research spending shows up in next quarter's revenue guidance.",
    ],
  },
  2: {
    title: "NVIDIA expands data center supply as AI compute demand grows",
    source: "Tech Daily",
    body: [
      "NVIDIA is expanding data center supply capacity as demand for AI compute keeps surging. The company is working to clear a backlog of orders from major cloud providers racing to build AI infrastructure.",
      "The gap between demand and high end chip supply remains a key focus. Supply chain resilience is seen as decisive for how long data center revenue growth can be sustained.",
    ],
  },
  3: {
    title: "Microsoft reports Azure growth holding strong this quarter",
    source: "Finance Post",
    body: [
      "Microsoft reported Azure growth holding strong this quarter, driven by cloud adoption and AI workloads. The cloud segment once again became the company's primary growth engine.",
      "Management emphasized continued investment in data center capacity. Investors read Azure's consistent growth as an important signal of long term competitiveness.",
    ],
  },
  4: {
    title: "The Fed holds rates steady, markets respond cautiously",
    source: "Macro Brief",
    body: [
      "The US central bank decided to hold its benchmark rate at the current level, in line with most market expectations. Officials stressed a data driven approach before setting the next policy direction.",
      "Markets responded cautiously, digesting signals on inflation and employment. The decision carries broad implications for equity valuations, especially sectors sensitive to borrowing costs.",
    ],
  },
  5: {
    title: "Amazon reshapes its logistics network to cut delivery costs",
    source: "Retail Signal",
    body: [
      "Amazon is reshaping its logistics network to cut delivery costs and speed up delivery times. The company is optimizing warehouse locations and distribution routes to improve operational efficiency.",
      "Supply chain savings could improve the historically thin retail margin. Analysts are watching the impact on free cash flow in the coming quarter.",
    ],
  },
  6: {
    title: "Alphabet expands AI integration across its search product line",
    source: "Tech Daily",
    body: [
      "Alphabet is expanding AI integration across its search product line, bringing generative summaries and answers to more users. The move underscores AI as the core of the company's product strategy.",
      "The challenge is preserving ad relevance while improving the search experience. Investors view this balance as important for the sustainability of ad revenue.",
    ],
  },
  7: {
    title: "Tesla ramps up battery plant production ahead of next quarter",
    source: "Auto Wire",
    body: [
      "Tesla is ramping up battery plant production ahead of next quarter to meet demand for electric vehicles and energy storage. The capacity increase is seen as crucial to the company's delivery targets.",
      "Battery production efficiency ties directly to vehicle cost structure. The market is watching whether this new scale can protect margins amid price competition.",
    ],
  },
  8: {
    title: "Meta unveils new generative AI advertising tools",
    source: "Market Wire",
    body: [
      "Meta introduced a set of generative AI advertising tools that help advertisers create creative assets automatically. The features aim to improve campaign performance while simplifying workflows.",
      "Creative automation could drive ad spend from small businesses. Investors view adoption of these tools as support for ad revenue growth.",
    ],
  },
  9: {
    title: "Palantir wins new government contract for data analytics",
    source: "Gov Tech Brief",
    body: [
      "Palantir won a new government contract for its data analytics platform, strengthening its position in the public sector. The contract adds a recurring revenue stream analysts consider stable.",
      "Reliance on government budgets remains both a risk factor and an opportunity. The market is watching whether contract momentum can extend into the commercial sector.",
    ],
  },
  10: {
    title: "Coinbase sees trading volume surge amid crypto rally",
    source: "Crypto Ledger",
    body: [
      "Coinbase saw a surge in trading volume as a crypto market rally pulled retail and institutional interest back in. The heightened activity directly boosts transaction based revenue.",
      "Reliance on crypto volatility makes the company's revenue highly variable. Analysts highlight diversification efforts toward more stable services like custody and staking.",
    ],
  },
  11: {
    title: "Intel begins production on latest chip node at Arizona fab",
    source: "Tech Daily",
    body: [
      "Intel began production on its latest chip node at the Arizona fab, an important milestone in its push to reclaim semiconductor manufacturing leadership. The facility is part of a domestic capacity expansion.",
      "Successfully raising yields on the new node will determine cost competitiveness. Investors await proof that this major fab investment is starting to pay off.",
    ],
  },
};
