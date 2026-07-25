# @all-in/backend

Layanan AI Analysis untuk Stock AI. Pipeline multi agent di atas Gemini, dengan indikator
teknikal yang dihitung secara deterministik di kode, bukan oleh LLM.

Bagian dari monorepo `all-in` (Turborepo + pnpm workspace), tinggal berdampingan dengan
frontend Next.js di `apps/web`. Meski satu repo, backend ini tetap proses Node yang berdiri
sendiri dan dipanggil lintas origin lewat HTTP, bukan Route Handler Next.js, jadi tetap bisa
di-deploy terpisah dari frontend kapan saja.

## Prinsip desain

Indikator teknikal (RSI, EMA, MACD, tren, volatilitas) dihitung penuh di TypeScript. Gemini
hanya menafsirkan angka yang sudah jadi. Ini menghemat token, membuat hasil bisa diuji, dan
menghindari LLM mengarang perhitungan.

```
POST /api/analyze { ticker, risk_profile, investment_goal, locale }
        |
        v
Data Collector (bukan AI)
  yahoo-finance2 quoteSummary  -> fundamental (PE, ROE, D/E, margin, dividend)
  yahoo-finance2 chart         -> deret harga harian
  hitung RSI, EMA, MACD, tren  -> technical_score deterministik
  yahoo-finance2 search        -> headline berita
        |
        +----------------------+
        v                      v
AI Agent 1                AI Agent 2
Fundamental                Market Intelligence
-> score, reasons          -> score, reasons, context
        |                      |
        +----------+-----------+
                   v
        AI Agent 3, Decision
        -> recommendation, confidence, reason[],
           final_reasoning, what_could_change, risk_level
                   v
        Response JSON sesuai kontrak frontend
```

Agent 1 dan Agent 2 jalan paralel, Agent 3 menunggu keduanya.

## Menjalankan secara lokal

Install dependency sekali dari root monorepo (mencakup `apps/web`, `apps/backend`, dan
`packages/contracts` sekaligus):

```bash
cd all-in
pnpm install
cp apps/backend/.env.example apps/backend/.env
# isi GEMINI_API_KEY di apps/backend/.env dengan key dari https://aistudio.google.com/apikey
pnpm --filter @all-in/backend dev
```

Server hidup di `http://localhost:8081`. Cek dengan:

```bash
curl http://localhost:8081/health
```

## Environment

| Variabel | Default | Keterangan |
|---|---|---|
| `PORT` | `8081` | Port server |
| `GEMINI_API_KEY` | wajib | Key dari Google AI Studio |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Model penuh, dipakai Decision Agent |
| `GEMINI_LIGHT_MODEL` | `gemini-3.5-flash-lite` | Model ringan, dipakai Fundamental dan Market Intelligence Agent |
| `GEMINI_DAILY_CALL_LIMIT` | `18` | Batas panggilan Gemini per model per hari |
| `ALLOWED_ORIGIN` | `http://localhost:3000` | Origin frontend, pisahkan dengan koma untuk banyak origin |
| `ANALYSIS_CACHE_TTL_MS` | `600000` | Umur cache hasil analisis, isi `0` untuk mematikan |
| `RATE_LIMIT_PER_MINUTE` | `5` | Batas request `/api` per IP per menit |

`.env` tidak pernah ikut commit. Jangan pernah menaruh key asli di `.env.example`.

### Dua tingkat model, dan kenapa itu penting

Agent yang hanya **menafsirkan** angka yang sudah dihitung memakai model ringan dengan
`thinkingLevel: MINIMAL`. Agent yang benar benar **memutuskan** memakai model penuh dengan
`thinkingLevel: LOW`. Kalau jatah satu model habis, tingkat itu otomatis jatuh ke model
satunya.

Ini bukan sekadar soal biaya. Kuota Gemini dihitung **per project per model per hari**, jadi
membagi beban ke dua model berarti satu analisis memakai 2 jatah model ringan dan 1 jatah model
penuh, bukan 3 jatah dari satu model.

Ukuran nyata satu analisis pada `gemini-3.5-flash` dan `gemini-3.5-flash-lite`: sekitar **1.389
token masuk dan 749 token keluar**, selesai dalam **6 detik**. Pada tarif berbayar Flash saat
ini, itu sekitar **$0,0023 per analisis**.

### Batas kuota

Free tier Gemini adalah **20 permintaan per hari per model**, direset tengah malam waktu Pacific
(sekitar 14:00 WIB), dan dihitung **per project, bukan per API key**, sehingga membuat key baru
di project yang sama tidak mengembalikan kuota.

`GEMINI_DAILY_CALL_LIMIT` adalah penghitung milik backend sendiri, sengaja di bawah 20. Kalau
jatah habis, panggilan ditolak **sebelum** dikirim ke jaringan, jadi percobaan yang sudah pasti
gagal tidak menghabiskan apa pun. Penghitungnya disimpan di `.cache/gemini-budget.json` supaya
bertahan melewati restart, dan sisa jatahnya bisa dilihat kapan saja lewat `GET /health` tanpa
membakar satu panggilan pun.

## Endpoint

### `GET /health`

```json
{
  "status": "ok",
  "service": "all-in-backend",
  "model": "gemini-3.5-flash",
  "time": "...",
  "quota": {
    "pacificDate": "2026-07-25",
    "dailyLimitPerModel": 18,
    "models": [
      { "model": "gemini-3.5-flash", "used": 1, "remaining": 17 },
      { "model": "gemini-3.5-flash-lite", "used": 2, "remaining": 16 }
    ]
  }
}
```

### `POST /api/analyze`

Request:

```json
{
  "ticker": "AAPL",
  "risk_profile": "conservative | moderate | aggressive",
  "investment_goal": "short_term | medium_term | long_term",
  "locale": "id | en"
}
```

Response mengikuti `analyzeResponseSchema` di `packages/contracts/src/analysis.ts`:

```json
{
  "recommendation": "BUY | HOLD | SELL",
  "confidence": 84,
  "fundamental_score": 82,
  "technical_score": 89,
  "market_intelligence_score": 68,
  "reason": ["...", "...", "..."],
  "company_name": "Apple Inc.",
  "sector": "Technology",
  "risk_level": "Low | Medium | High",
  "final_reasoning": "...",
  "what_could_change": "...",
  "market_context": "...",
  "fundamental_analysis": "...",
  "technical_analysis": "...",
  "market_data": {
    "price": 333.02,
    "changePercent1y": 24.04,
    "pe": 38.9,
    "roe": 1.41,
    "rsi": 65.2,
    "trend": "uptrend",
    "news": ["..."]
  }
}
```

Status error:

| Status | Kode | Kapan |
|---|---|---|
| `422` | validasi | Body tidak sesuai skema |
| `404` | `ticker_not_found` | Ticker tidak dikenal Yahoo Finance |
| `429` | `rate_limited` | Melewati batas per menit |
| `429` | `ai_quota_exceeded` | Jatah harian Gemini habis di semua model |
| `502` | `market_data_unavailable` | Yahoo Finance bermasalah |
| `503` | `ai_unavailable` | Gemini gagal atau keluarannya tidak valid |

`ai_quota_exceeded` sengaja dipisahkan dari `ai_unavailable` karena tindakan penggunanya berbeda:
yang satu perlu menunggu sampai kuota direset, yang satu cukup mencoba lagi sebentar lagi.

## Menyambungkan ke frontend

Di `all-in/apps/web/.env.local`:

```
NEXT_PUBLIC_ANALYSIS_API_URL=http://localhost:8081
NEXT_PUBLIC_DIRECT_LIVE_PATHS=/api/analyze
```

Frontend punya tiga mode di `apps/web/src/lib/api.ts`, urutan prioritasnya: **direct backend**
(package ini) lebih dulu, lalu **local live** (route handler Next.js sendiri seperti
`/api/market`), lalu **mock**, lalu **remote Laravel**. Mengosongkan
`NEXT_PUBLIC_ANALYSIS_API_URL` otomatis mengembalikan `/api/analyze` ke mock, jadi frontend
tidak pernah rusak saat backend ini mati.

Badge "Data simulasi" di kartu hasil analisis hilang sendiri begitu variabel di atas terisi.

## Perintah

Dari root monorepo, jalankan lewat filter Turborepo:

```bash
pnpm --filter @all-in/backend dev        # tsx watch
pnpm --filter @all-in/backend build      # tsc ke dist
pnpm --filter @all-in/backend start      # jalankan hasil build
pnpm --filter @all-in/backend typecheck  # tsc --noEmit
pnpm --filter @all-in/backend test       # unit test indikator teknikal
```

Atau dari dalam folder `apps/backend`, cukup `pnpm dev`, `pnpm build`, dst.

## Kontrak tipe

Karena sekarang satu monorepo, kontrak `analyzeResponseSchema`, `wireRequestSchema`, dan
`marketDataSchema` hidup di satu tempat: `packages/contracts/src/analysis.ts` (paket
`@all-in/contracts`). Backend dan frontend (`apps/web/src/types/analysis.ts`) sama sama
meng-`import` dari paket ini, jadi tidak ada lagi salinan yang perlu disinkronkan manual. Bagian
yang murni khusus UI (label Title Case, `toWireRequest`) tetap tinggal di `apps/web`.

## Catatan operasional

- **Latensi**: satu analisis memanggil Yahoo Finance beberapa kali plus dua gelombang Gemini.
  Terukur sekitar 6 detik. Timeout per panggilan Gemini 30 detik.
- **Cache**: hasil disimpan per kombinasi ticker, profil risiko, horizon, dan bahasa, di memori
  sekaligus di `.cache/analysis.json` supaya bertahan melewati restart. Ini penting karena `tsx
  watch` me-restart proses tiap kali kode disentuh, sementara satu entri cache mewakili tiga
  panggilan Gemini yang sudah terpakai. Kalau nanti di-deploy multi instance dan cache perlu
  dibagi, itu pekerjaan lanjutan (Redis dan sejenisnya).
- **Model tidak selalu tersedia**: daftar dari `GET /v1beta/models` tidak menjamin model bisa
  dipakai. `gemini-2.5-flash-lite` tetap muncul di daftar tetapi menolak dengan `404, no longer
  available to new users`. Sebelum mengganti model di env, uji dulu dengan satu panggilan kecil.
- **Perbedaan antar generasi model**: model 3.x memakai `thinkingLevel`, bukan `thinkingBudget`.
  `gemini-3.5-flash-lite` menolak `thinkingBudget` dengan `400`. Kode ini memakai `thinkingLevel`
  karena diterima kedua model, sehingga rantai fallback aman ke dua arah.
- **Yahoo Finance tidak resmi**: skema respons bisa berubah sewaktu waktu. Data Collector sudah
  menormalkan simbol bertanda titik (`BRK.B` menjadi `BRK-B`) dan punya fallback per modul
  supaya satu modul bermasalah tidak mematikan seluruh analisis.
- **Hosting**: ini proses Node yang berjalan terus, bukan serverless function. Butuh tempat yang
  bisa menjalankan proses persisten (Railway, Render, Fly.io, atau VPS).
- **CORS**: batasi `ALLOWED_ORIGIN` ke domain frontend yang benar. Jangan pakai wildcard, karena
  tiap panggilan endpoint ini berbiaya.
