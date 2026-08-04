import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

/**
 * Empat tabel pertama adalah milik better-auth dan namanya mengikuti bawaan
 * pustaka itu. Kolom `notifyPriceAlert` dan `notifyNewsDigest` ditambahkan ke
 * `user` karena halaman Settings sudah memakainya sejak masih mock.
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  notifyPriceAlert: boolean("notify_price_alert").notNull().default(true),
  notifyNewsDigest: boolean("notify_news_digest").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const watchlist = pgTable(
  "watchlist",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ticker: text("ticker").notNull(),
    /**
     * Nama perusahaan disimpan saat ditambahkan, bukan diambil ulang tiap kali
     * daftar dibaca. Nama itu metadata yang praktis tidak berubah, berbeda dari
     * harga, dan mengambilnya per baris berarti satu panggilan Yahoo tambahan
     * untuk setiap saham yang dipantau.
     */
    name: text("name"),
    /** Hasil analisis terakhir, ditampilkan sebagai badge di baris watchlist. */
    recommendation: text("recommendation"),
    confidence: integer("confidence"),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (table) => [
    unique("watchlist_user_ticker_unique").on(table.userId, table.ticker),
    index("watchlist_user_idx").on(table.userId),
  ],
);

export const priceAlert = pgTable(
  "price_alert",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ticker: text("ticker").notNull(),
    targetPrice: real("target_price").notNull(),
    condition: text("condition").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("price_alert_user_ticker_unique").on(table.userId, table.ticker),
    index("price_alert_user_idx").on(table.userId),
  ],
);

/**
 * Satu baris di sini mewakili tiga panggilan Gemini yang sudah dibayar. Inilah
 * sebabnya hasil analisis disimpan, bukan sekadar ditaruh di state React yang
 * hilang begitu halaman di-refresh.
 */
export const analysis = pgTable(
  "analysis",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ticker: text("ticker").notNull(),
    riskProfile: text("risk_profile").notNull(),
    investmentGoal: text("investment_goal").notNull(),
    locale: text("locale").notNull(),
    /** Objek AnalyzeResponse utuh sesuai packages/contracts. */
    payload: jsonb("payload").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("analysis_user_created_idx").on(table.userId, table.createdAt),
    index("analysis_user_ticker_idx").on(table.userId, table.ticker),
  ],
);

/**
 * Penghitung panggilan Gemini per model per tanggal Pacific. Menggantikan
 * berkas `.cache/gemini-budget.json` yang dipakai backend Express sebelumnya,
 * karena fungsi serverless tidak punya disk yang bertahan antar permintaan.
 * Reset tanggal terjadi otomatis lewat WHERE saat query, bukan lewat job
 * terjadwal, supaya tidak butuh proses latar belakang tambahan.
 */
export const geminiBudget = pgTable(
  "gemini_budget",
  {
    model: text("model").notNull(),
    pacificDate: text("pacific_date").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.model, table.pacificDate] })],
);

/**
 * Cache hasil analisis lengkap, kunci mengikuti ticker, profil risiko, horizon,
 * bahasa, dan model, sama seperti TtlCache berbasis berkas sebelumnya. Ini yang
 * membuat permintaan identik dalam jendela waktu singkat tidak memanggil Gemini
 * ulang, penting karena satu analisis memakai tiga panggilan berbayar.
 */
export const analysisCache = pgTable("analysis_cache", {
  cacheKey: text("cache_key").primaryKey(),
  payload: jsonb("payload").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const notification = pgTable(
  "notification",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    /** Bagian yang berbeda beda per jenis notifikasi, mengikuti tipe di frontend. */
    payload: jsonb("payload").notNull(),
    href: text("href").notNull(),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("notification_user_created_idx").on(table.userId, table.createdAt)],
);
