# API Contract, Stock AI Frontend to Backend

Dokumen ini adalah sumber kebenaran tunggal untuk integrasi antara frontend Next.js
(`apps/web`) dan backend partner (InvestIQ AI: Laravel 11 + FastAPI + LangGraph + Gemini).
Tujuannya agar kedua sisi bisa bekerja paralel tanpa saling menebak bentuk data.

## Arsitektur dan port

```
Next.js (3000)  ->  Laravel API Gateway (8080)  ->  FastAPI AI Service (8000)
```

- Frontend hanya bicara ke Laravel. Frontend tidak memanggil FastAPI langsung di produksi.
- Laravel bertanggung jawab: auth (Sanctum), rate limit, cache, dan menerjemahkan bentuk
  request/response ke/dari FastAPI.
- `NEXT_PUBLIC_API_URL` di frontend menunjuk ke Laravel (`http://localhost:8080` saat lokal).

## Konfigurasi frontend

| Env | Nilai lokal | Fungsi |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | base URL Laravel |
| `NEXT_PUBLIC_ENABLE_MOCK_API` | `true` | master switch mock |
| `NEXT_PUBLIC_LIVE_API_PATHS` | kosong | daftar prefix path yang dipaksa live meski mock aktif |

**Penyalaan bertahap per-endpoint.** Selama mock aktif, sebuah path memakai mock KECUALI
prefixnya tercantum di `NEXT_PUBLIC_LIVE_API_PATHS`. Jadi untuk menyalakan analyze saja
(sisanya tetap mock), set:

```
NEXT_PUBLIC_LIVE_API_PATHS=/api/analyze
```

Begitu backend menambah endpoint lain, tinggal tambahkan prefixnya ke daftar ini.

## Autentikasi (Laravel Sanctum, SPA cookie)

Frontend memakai alur Sanctum SPA. Untuk setiap request non-GET, frontend lebih dulu memanggil
`GET /sanctum/csrf-cookie`, lalu mengirim cookie `XSRF-TOKEN` kembali sebagai header
`X-XSRF-TOKEN`, dengan `credentials: include`. Backend wajib menyediakan dan menerima:

- `GET /sanctum/csrf-cookie`
- `POST /login` -> mengembalikan objek user (lihat User di bawah)
- `POST /register` -> mengembalikan objek user
- `POST /logout`
- `GET /api/user` -> objek user; `401` bila belum login
- `PATCH /api/user` -> objek user setelah diperbarui

### Objek User

```jsonc
{
  "id": 1,
  "name": "Clay",
  "email": "clay@example.com",
  "notifyPriceAlert": true,
  "notifyNewsDigest": true
}
```

## Endpoint inti, POST /api/analyze

Endpoint pertama yang diintegrasikan. Laravel menerima format wire di bawah, meneruskan ke
FastAPI `POST /api/v1/analyze`, lalu mengembalikan objek `data` (boleh tetap dibungkus
`{success, data}`, frontend menangani keduanya).

### Request (wire, dikirim frontend)

```jsonc
{
  "ticker": "AAPL",
  "risk_profile": "conservative | moderate | aggressive",
  "investment_goal": "short_term | medium_term | long_term"
}
```

Catatan: label di UI memakai Title Case, tetapi frontend sudah memetakannya ke format snake di
atas sebelum dikirim (`toWireRequest` di `types/analysis.ts`). Backend cukup menerima snake.

### Response

Frontend menerima salah satu dari dua bentuk dan menanganinya secara identik:

```jsonc
{ "success": true, "data": { /* objek di bawah */ }, "timestamp": "...", "processing_time": "..." }
```

atau langsung objeknya. Bentuk `data`:

```jsonc
{
  "recommendation": "BUY | HOLD | SELL",   // wajib, huruf besar
  "confidence_score": 89,                   // wajib, 0..100 (frontend memetakan ke confidence)
  "reasons": ["...", "..."],                // wajib, minimal 1 (frontend memetakan ke reason)
  "fundamental_score": 82,                  // wajib, 0..100
  "technical_score": 74,                    // wajib, 0..100
  "agent_scores": {                         // sumber skor Market Intelligence
    "fundamental": 82,
    "technical": 74,
    "market_intelligence": 68
  },
  "company_name": "Apple Inc.",             // opsional
  "sector": "Technology",                   // opsional
  "risk_level": "Low | Medium | High",      // opsional
  "final_reasoning": "...",                 // opsional, ringkasan keputusan
  "what_could_change": "...",               // opsional, kondisi yang bisa membalik verdict
  "market_context": "...",                  // opsional
  "fundamental_analysis": "...",            // opsional
  "technical_analysis": "...",              // opsional
  "market_data": {                          // opsional, ditampilkan sebagai snapshot pasar
    "price": 184.32,
    "price_change_1y": 12.4,
    "pe": 28.5,
    "roe": 0.147,
    "technical_indicators": { "rsi": 62, "trend": "uptrend" },
    "news": [{ "title": "..." }]
  }
}
```

Pemetaan yang dilakukan frontend (`normalizeAnalyzeResponse` di
`features/analysis/analyze-adapter.ts`): membuka `data`, `confidence_score -> confidence`,
`reasons -> reason`, `agent_scores.market_intelligence -> market_intelligence_score`, menormalkan
`market_data`. Field opsional yang kosong akan otomatis tidak ditampilkan (degradasi anggun),
jadi backend boleh mengirim sebagian saja pada tahap awal.

### Skor ke-3 direframe menjadi Market Intelligence

Frontend tidak lagi memakai `risk_score` numerik. Kartu skor ke-3 dan langkah AI Agent 2 kini
memakai `agent_scores.market_intelligence` (0..100). Tingkat risiko ditampilkan terpisah sebagai
badge kategori dari `risk_level` (Low/Medium/High).

### Error

Ikuti format validasi Laravel; frontend membacanya menjadi `ApiError`:

```jsonc
{ "message": "Pesan ringkas", "errors": { "ticker": ["Ticker tidak dikenal"] } }
```

Ticker tidak ditemukan sebaiknya `404`. Kegagalan AI internal `500` dengan `message` yang
ramah pengguna.

## Endpoint lain, status dan target kontrak

Frontend masih memakai mock untuk semua ini. Nyalakan satu per satu lewat
`NEXT_PUBLIC_LIVE_API_PATHS` setelah backend menyediakannya. Bentuk mock di
`apps/web/src/lib/mock-api.ts` adalah acuan bentuk respons yang diharapkan.

| Path | Method | Status backend | Catatan |
|---|---|---|---|
| `/api/analyze` | POST | perlu gateway Laravel | FastAPI `/api/v1/analyze` sudah ada |
| `/api/company/{ticker}` | GET | belum ada | profil perusahaan + metrik |
| `/api/company/{ticker}/candles` | GET | belum ada | data lilin untuk chart |
| `/api/news` dan `/api/news/{id}` | GET | belum ada | daftar dan detail berita |
| `/api/market` | GET | sebagian | indeks + gainer/loser |
| `/api/watchlist` | GET/POST/DELETE | belum ada | watchlist user |
| `/api/alerts` dan `/api/alerts/{ticker}` | GET/PUT/DELETE | belum ada | price alert |
| `/api/notifications` | GET/PATCH/POST | belum ada | pusat notifikasi in-app |

## Risiko dan catatan operasional

- **Latensi.** Analisis nyata memakai multi-agent + Gemini + yfinance, realistis 10 sampai 30
  detik. Gateway Laravel butuh timeout HTTP longgar (mis. 60 detik). Bila terlalu lama, pola
  yang lebih baik adalah job async + polling; frontend saat ini memakai state loading sinkron.
- **Kuota Gemini.** Terapkan strategi model bertingkat: model berat untuk agent reasoning
  (Fundamental, Market Intelligence, Decision), model ringan untuk ringkas berita, klasifikasi
  sentimen, ekstraksi dokumen, dan chat AI Workspace.
- **Indikator teknikal dihitung di Python** (RSI/MACD/EMA), Gemini hanya menginterpretasi. Ini
  sudah benar di `ai_service/agent.py`.
- **Universe ticker.** Frontend punya daftar tetap untuk mock. Saat analyze live, backend bisa
  menerima ticker apa pun via yfinance, tetapi halaman profil/watchlist masih mock sampai
  endpointnya dibangun.
- **AI Workspace** (upload dokumen + chat) sudah ada di backend tetapi belum punya UI di
  frontend. Ini kandidat fitur berikutnya, di luar cakupan integrasi analyze.
