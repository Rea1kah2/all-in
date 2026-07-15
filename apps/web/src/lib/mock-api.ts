import { ApiError } from "@/lib/api";
import type { User } from "@/types/auth";

const USER_STORE_KEY = "mock:user";
const SESSION_COOKIE = "mock_session";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function persistUser(user: User) {
  localStorage.setItem(USER_STORE_KEY, JSON.stringify(user));
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=86400; samesite=lax`;
}

function clearUser() {
  localStorage.removeItem(USER_STORE_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

function storedUser(): User | null {
  const raw = localStorage.getItem(USER_STORE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

type Credentials = { email?: string; password?: string; name?: string };

export async function mockApiFetch<T>(
  path: string,
  method: string,
  body: unknown,
): Promise<T> {
  await delay(600);

  const input = (body ?? {}) as Credentials;

  if (path === "/api/user" && method === "GET") {
    const user = storedUser();
    if (!user) {
      throw new ApiError("Belum masuk", 401);
    }
    return user as T;
  }

  if (path === "/login" && method === "POST") {
    if (input.password === "salah") {
      throw new ApiError("Data yang diberikan tidak valid", 422, {
        email: ["Email atau kata sandi tidak cocok"],
      });
    }
    const user: User = {
      id: 1,
      name: "Clay",
      email: input.email ?? "clay@example.com",
    };
    persistUser(user);
    return user as T;
  }

  if (path === "/register" && method === "POST") {
    if (input.email === "taken@example.com") {
      throw new ApiError("Data yang diberikan tidak valid", 422, {
        email: ["Email sudah terdaftar"],
      });
    }
    const user: User = {
      id: 1,
      name: input.name ?? "Pengguna baru",
      email: input.email ?? "baru@example.com",
    };
    persistUser(user);
    return user as T;
  }

  if (path === "/logout" && method === "POST") {
    clearUser();
    return undefined as T;
  }

  throw new ApiError(`Endpoint tiruan belum tersedia, ${method} ${path}`, 404);
}
