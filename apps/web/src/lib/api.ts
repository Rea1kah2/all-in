import { env } from "@/config/env";
import { mockApiFetch } from "@/lib/mock-api";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;
  /**
   * Kode stabil dari backend AI Analysis, dipakai UI untuk memilih pesan yang
   * sudah diterjemahkan. Backend Laravel tidak mengirim ini, jadi bisa kosong.
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

function readCookie(name: string): string | null {
  for (const entry of document.cookie.split("; ")) {
    const separator = entry.indexOf("=");
    if (separator === -1) continue;
    if (entry.slice(0, separator) === name) {
      return decodeURIComponent(entry.slice(separator + 1));
    }
  }
  return null;
}

let csrfPromise: Promise<void> | null = null;

function ensureCsrfCookie() {
  if (!csrfPromise) {
    csrfPromise = fetch(`${env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`, {
      credentials: "include",
    }).then(() => undefined);
  }
  return csrfPromise;
}

function isLocalLivePath(path: string): boolean {
  return env.NEXT_PUBLIC_LOCAL_LIVE_PATHS.some((prefix) => path.startsWith(prefix));
}

function isDirectPath(path: string): boolean {
  if (!env.NEXT_PUBLIC_ANALYSIS_API_URL) {
    return false;
  }
  return env.NEXT_PUBLIC_DIRECT_LIVE_PATHS.some((prefix) => path.startsWith(prefix));
}

export function isMockPath(path: string): boolean {
  if (isDirectPath(path) || isLocalLivePath(path)) {
    return false;
  }
  if (!env.NEXT_PUBLIC_ENABLE_MOCK_API) {
    return false;
  }
  return !env.NEXT_PUBLIC_LIVE_API_PATHS.some((prefix) => path.startsWith(prefix));
}

async function plainFetch<T>(url: string, method: string, body: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
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

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";

  if (isDirectPath(path)) {
    return plainFetch<T>(
      `${env.NEXT_PUBLIC_ANALYSIS_API_URL}${path}`,
      method,
      options.body,
    );
  }

  if (isLocalLivePath(path)) {
    return plainFetch<T>(path, method, options.body);
  }

  if (isMockPath(path)) {
    return mockApiFetch<T>(path, options.method ?? "GET", options.body);
  }

  const headers: Record<string, string> = { Accept: "application/json" };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (method !== "GET") {
    await ensureCsrfCookie();
    const token = readCookie("XSRF-TOKEN");
    if (token) {
      headers["X-XSRF-TOKEN"] = token;
    }
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

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

    throw new ApiError(message, response.status, fieldErrors);
  }

  return payload as T;
}

export function resetCsrfCache() {
  csrfPromise = null;
}
