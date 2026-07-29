export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;
  /**
   * Kode stabil dari Route Handler, dipakai UI untuk memilih pesan yang sudah
   * diterjemahkan. Tidak semua endpoint mengirimnya, jadi bisa kosong.
   */
  readonly code?: string;

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string[]> = {},
    code?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.code = code;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

/**
 * Semua permintaan menuju Route Handler milik aplikasi ini sendiri, satu origin.
 *
 * Dulu fungsi ini memilih antara empat tujuan: mock di browser, Route Handler
 * lokal, backend AI Analysis langsung, dan gateway Laravel. Ketiga jalur selain
 * Route Handler sudah tidak ada lagi. Mock dibuang karena semua data kini nyata,
 * panggilan langsung ke backend dipindah ke server supaya alamat dan secretnya
 * tidak bocor ke browser, dan gateway Laravel tidak pernah jadi dipakai. Auth
 * memakai `authClient` dari better-auth, bukan lewat sini.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError("Tidak bisa terhubung ke server", 0, {}, "network_error");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : "Terjadi kesalahan pada server";
    const fieldErrors =
      payload && typeof payload === "object" && "errors" in payload
        ? (payload.errors as Record<string, string[]>)
        : {};
    const code =
      payload && typeof payload === "object" && "code" in payload
        ? String(payload.code)
        : undefined;
    throw new ApiError(message, response.status, fieldErrors, code);
  }

  return payload as T;
}
