import { env } from "@/config/env";
import { mockApiFetch } from "@/lib/mock-api";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
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

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (env.NEXT_PUBLIC_ENABLE_MOCK_API) {
    return mockApiFetch<T>(path, options.method ?? "GET", options.body);
  }

  const method = options.method ?? "GET";
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
