"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import {
  investmentGoalSchema,
  type LoginInput,
  type RegisterInput,
  riskProfileSchema,
  type User,
} from "@/types/auth";

type BetterAuthError = {
  message?: string;
  code?: string;
  status?: number;
} | null;

type BetterAuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt?: string | Date;
  notifyPriceAlert?: boolean;
  notifyNewsDigest?: boolean;
  defaultRiskProfile?: string;
  defaultInvestmentGoal?: string;
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
    image: raw.image ?? null,
    createdAt: raw.createdAt
      ? new Date(raw.createdAt).toISOString()
      : new Date().toISOString(),
    notifyPriceAlert: raw.notifyPriceAlert ?? true,
    notifyNewsDigest: raw.notifyNewsDigest ?? true,
    defaultRiskProfile: parseRiskProfile(raw.defaultRiskProfile),
    defaultInvestmentGoal: parseInvestmentGoal(raw.defaultInvestmentGoal),
  };
}

/**
 * Nilai dari database hanya `text`, jadi divalidasi di sini supaya tipe di UI
 * benar benar sempit dan nilai tak dikenal tidak diam diam menjalar ke formulir.
 */
function parseRiskProfile(value: unknown): User["defaultRiskProfile"] {
  const parsed = riskProfileSchema.safeParse(value);
  return parsed.success ? parsed.data : "moderate";
}

function parseInvestmentGoal(value: unknown): User["defaultInvestmentGoal"] {
  const parsed = investmentGoalSchema.safeParse(value);
  return parsed.success ? parsed.data : "long_term";
}

export function useSession() {
  const { data, isPending } = authClient.useSession();

  // `toUser` selalu membuat objek literal baru, jadi tanpa memo di sini setiap
  // komponen yang memakai useSession() menerima referensi `data` yang berbeda
  // di tiap render walau isinya sama. Efek yang menaruh `user` di dependency
  // array (seperti ProfileForm yang mereset formulir saat sesi berubah) lalu
  // terpicu setiap render, dan kalau efek itu sendiri memicu render ulang
  // (mis. lewat reset() pada react-hook-form), hasilnya infinite loop. Sudah
  // terlihat sendiri sebagai "Maximum update depth exceeded" di /profile.
  const user = useMemo(
    () => (data?.user ? toUser(data.user as BetterAuthUser) : null),
    [data?.user],
  );

  return { data: user, isPending };
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
        Pick<
          User,
          | "name"
          | "email"
          | "image"
          | "notifyPriceAlert"
          | "notifyNewsDigest"
          | "defaultRiskProfile"
          | "defaultInvestmentGoal"
        >
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

/**
 * Sebelum ini tidak ada cara sama sekali bagi pengguna mengganti kata sandinya,
 * padahal akunnya memakai email dan kata sandi. `revokeOtherSessions` menutup
 * sesi di perangkat lain, yang memang yang diharapkan orang saat mengganti kata
 * sandi karena curiga akunnya dipakai orang lain.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: { currentPassword: string; newPassword: string }) => {
      const { error } = await authClient.changePassword({
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        throw toApiError(error, "Gagal mengganti kata sandi");
      }
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (password: string) => {
      const { error } = await authClient.deleteUser({ password });
      if (error) throw toApiError(error, "Gagal menghapus akun");
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/");
    },
  });
}
