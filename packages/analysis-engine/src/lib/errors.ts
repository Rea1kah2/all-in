export class ServiceError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
    this.code = code;
  }
}

export function tickerNotFound(ticker: string): ServiceError {
  return new ServiceError(`Saham ${ticker} tidak ditemukan`, 404, "ticker_not_found");
}

export function upstreamDataError(): ServiceError {
  return new ServiceError(
    "Data pasar sedang tidak tersedia, coba lagi sebentar lagi",
    502,
    "market_data_unavailable",
  );
}

export function aiQuotaExceeded(): ServiceError {
  return new ServiceError(
    "Jatah analisis AI hari ini sudah habis, coba lagi setelah kuota harian direset",
    429,
    "ai_quota_exceeded",
  );
}

/**
 * Penanda internal bahwa satu model sedang kelebihan beban. Tidak pernah sampai
 * ke pengguna: `askGeminiJson` memakainya untuk memutuskan mencoba model
 * berikutnya, dan kalau semua model gagal barulah dilaporkan sebagai
 * `aiUnavailable`.
 */
export function modelOverloaded(): ServiceError {
  return new ServiceError("Model sedang sibuk", 503, "model_overloaded");
}

export function aiUnavailable(): ServiceError {
  return new ServiceError(
    "Layanan analisis AI sedang tidak tersedia, coba lagi sebentar lagi",
    503,
    "ai_unavailable",
  );
}
