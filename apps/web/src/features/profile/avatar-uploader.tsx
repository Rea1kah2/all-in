"use client";

import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/use-auth";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

/**
 * Avatar inisial dipertahankan sebagai fallback, bukan dibuang. Pengguna tanpa
 * foto tetap butuh sesuatu yang rapi, dan pola ini sudah dipakai di menu
 * pengguna sejak awal.
 */
function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${second}`.toUpperCase() || "?";
}

async function uploadAvatar(file: File): Promise<void> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/profile/avatar", { method: "POST", body });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : "Gagal mengunggah foto";
    const fieldErrors =
      payload && typeof payload === "object" && "errors" in payload
        ? (payload.errors as Record<string, string[]>)
        : {};
    throw new ApiError(message, response.status, fieldErrors);
  }
}

export function AvatarUploader() {
  const { data: user } = useSession();
  const t = useTranslations("profile");
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      setError(null);
      // Sesi memuat `image`, jadi harus disegarkan supaya foto baru langsung
      // tampil di sini maupun di menu pengguna tanpa memuat ulang halaman.
      void authClient.getSession({ query: { disableCookieCache: true } });
    },
    onError: (cause) => {
      setError(
        cause instanceof ApiError
          ? (cause.fieldErrors.file?.[0] ?? cause.message)
          : t("uploadFailed"),
      );
    },
  });

  const remove = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/profile/avatar", { method: "DELETE" });
      if (!response.ok) throw new Error("delete failed");
    },
    onSuccess: () => {
      setError(null);
      void authClient.getSession({ query: { disableCookieCache: true } });
    },
    onError: () => setError(t("uploadFailed")),
  });

  if (!user) {
    return <div className="size-20 animate-pulse rounded-full bg-surface" />;
  }

  const busy = upload.isPending || remove.isPending;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-line bg-surface">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center font-mono text-lg text-ink-muted">
            {initialsOf(user.name)}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={upload.isPending}
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {user.image ? t("changePhoto") : t("uploadPhoto")}
          </Button>

          {user.image ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              loading={remove.isPending}
              disabled={busy}
              onClick={() => remove.mutate()}
            >
              {t("removePhoto")}
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-ink-faint">{t("photoHint")}</p>
        {error ? <p className="text-bear text-xs">{error}</p> : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload.mutate(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
