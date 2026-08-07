"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChangePassword, useDeleteAccount } from "@/features/auth/use-auth";
import { ApiError } from "@/lib/api";
import { type ChangePasswordInput, changePasswordSchema } from "@/types/auth";

function ChangePasswordForm() {
  const t = useTranslations("security");
  const tCommon = useTranslations("common");
  const changePassword = useChangePassword();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit((values) => {
    setDone(false);
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          reset();
          setDone(true);
        },
        onError: (error) => {
          setError("currentPassword", {
            message: error instanceof ApiError ? error.message : t("changePassword"),
          });
        },
      },
    );
  });

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4" noValidate>
      <Field
        label={t("currentPassword")}
        htmlFor="currentPassword"
        error={errors.currentPassword?.message}
      >
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword)}
          {...register("currentPassword")}
        />
      </Field>

      <Field
        label={t("newPassword")}
        htmlFor="newPassword"
        error={errors.newPassword?.message}
      >
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPassword)}
          {...register("newPassword")}
        />
      </Field>

      <Field
        label={t("confirmPassword")}
        htmlFor="confirmPassword"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
      </Field>

      <p className="text-xs text-ink-faint">{t("passwordNote")}</p>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={changePassword.isPending}>
          {tCommon("save")}
        </Button>
        {done ? <p className="text-teal text-xs">{t("passwordChanged")}</p> : null}
      </div>
    </form>
  );
}

/**
 * Hapus akun memakai Dialog langsung, bukan `ConfirmDialog`, karena tindakan
 * ini perlu memasukkan kata sandi sedangkan ConfirmDialog sengaja hanya
 * menampilkan teks dan tombol.
 */
function DeleteAccount() {
  const t = useTranslations("security");
  const tConfirm = useTranslations("confirm");
  const deleteAccount = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onConfirm = () => {
    if (!password) {
      setError(t("passwordRequired"));
      return;
    }
    setError(null);
    deleteAccount.mutate(password, {
      onError: (cause) => {
        setError(cause instanceof ApiError ? cause.message : t("deleteAccount"));
      },
    });
  };

  return (
    <div className="rounded-card border border-bear/40 bg-bear-bg/30 p-6">
      <h3 className="text-sm text-ink">{t("dangerTitle")}</h3>
      <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-ink-muted">
        {t("dangerBody")}
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="destructive" size="sm" className="mt-4">
            {t("deleteAccount")}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogTitle>{t("deleteConfirmTitle")}</DialogTitle>
          <DialogDescription>{t("deleteConfirmBody")}</DialogDescription>

          <div className="mt-4">
            <Field
              label={t("currentPassword")}
              htmlFor="deletePassword"
              error={error ?? undefined}
            >
              <Input
                id="deletePassword"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                {tConfirm("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              loading={deleteAccount.isPending}
              onClick={onConfirm}
            >
              {t("deleteConfirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function SecuritySection() {
  const t = useTranslations("security");

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm text-ink">{t("title")}</h2>
        <p className="mt-0.5 text-xs text-ink-muted">{t("subtitle")}</p>
      </div>

      <div className="rounded-card border border-line bg-surface p-6">
        <ChangePasswordForm />
      </div>

      <DeleteAccount />
    </section>
  );
}
