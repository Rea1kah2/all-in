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

export function aiUnavailable(): ServiceError {
  return new ServiceError(
    "Layanan analisis AI sedang tidak tersedia, coba lagi sebentar lagi",
    503,
    "ai_unavailable",
  );
}
