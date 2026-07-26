"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { LoginInput, RegisterInput, User } from "@/types/auth";

type BetterAuthError = {
  message?: string;
  code?: string;
  status?: number;
} | null;

type BetterAuthUser = {
  id: string;
  name: string;
  email: string;
  notifyPriceAlert?: boolean;
  notifyNewsDigest?: boolean;
};

/**
 * better-auth tidak mengembalikan error per-field seperti Laravel, hanya satu
 * `code` dan `message`. "Email sudah terdaftar" adalah satu satunya kasus yang
 * form login/register benar benar memetakan ke field tertentu, jadi hanya itu
 * yang diterjemahkan; sisanya jatuh ke pesan umum yang sudah ditangani form.
 */
function toApiError(error: BetterAuthError, fallback: string): ApiError {
  if (!error) return new ApiError(fallback, 500);

  const fieldErrors: Record<string, string[]> =
    error.code === "USER_ALREADY_EXISTS" ||
    error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      ? { email: ["Email sudah terdaftar"] }
      : {};

  return new ApiError(error.message ?? fallback, error.status ?? 400, fieldErrors);
}

function toUser(raw: BetterAuthUser): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    notifyPriceAlert: raw.notifyPriceAlert ?? true,
    notifyNewsDigest: raw.notifyNewsDigest ?? true,
  };
}

export function useSession() {
  const { data, isPending } = authClient.useSession();
  return {
    data: data?.user ? toUser(data.user as BetterAuthUser) : null,
    isPending,
  };
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data, error } = await authClient.signIn.email({
        email: input.email,
        password: input.password,
      });
      if (error) throw toApiError(error, "Email atau kata sandi salah");
      return toUser(data.user as BetterAuthUser);
    },
    onSuccess: () => {
      router.replace("/home");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data, error } = await authClient.signUp.email({
        name: input.name,
        email: input.email,
        password: input.password,
      });
      if (error) throw toApiError(error, "Registrasi gagal, coba lagi");
      return toUser(data.user as BetterAuthUser);
    },
    onSuccess: () => {
      router.replace("/home");
    },
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: async (
      input: Partial<
        Pick<User, "name" | "email" | "notifyPriceAlert" | "notifyNewsDigest">
      >,
    ) => {
      const { email, ...rest } = input;

      if (Object.keys(rest).length > 0) {
        const { error } = await authClient.updateUser(rest);
        if (error) throw toApiError(error, "Gagal memperbarui profil");
      }

      if (email !== undefined) {
        const { error } = await authClient.changeEmail({ newEmail: email });
        if (error) throw toApiError(error, "Gagal memperbarui email");
      }

      const session = await authClient.getSession();
      if (!session.data?.user) {
        throw new ApiError("Sesi tidak ditemukan, silakan masuk ulang", 401);
      }
      return toUser(session.data.user as BetterAuthUser);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();
      if (error) throw toApiError(error, "Gagal keluar");
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
}
