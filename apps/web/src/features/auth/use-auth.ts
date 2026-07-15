"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch, resetCsrfCache } from "@/lib/api";
import type { LoginInput, RegisterInput, User } from "@/types/auth";

const sessionKey = ["session"] as const;

export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: async () => {
      try {
        return await apiFetch<User>("/api/user");
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<User>("/login", { method: "POST", body: input }),
    onSuccess: (user) => {
      queryClient.setQueryData(sessionKey, user);
      router.replace("/home");
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiFetch<User>("/register", { method: "POST", body: input }),
    onSuccess: (user) => {
      queryClient.setQueryData(sessionKey, user);
      router.replace("/home");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => apiFetch<void>("/logout", { method: "POST" }),
    onSuccess: () => {
      resetCsrfCache();
      queryClient.clear();
      router.replace("/login");
    },
  });
}
