"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSession, useUpdateUser } from "@/features/auth/use-auth";
import { ApiError } from "@/lib/api";
import { type UpdateProfileInput, updateProfileSchema } from "@/types/auth";

export function ProfileForm() {
  const { data: user } = useSession();
  const updateUser = useUpdateUser();
  const t = useTranslations("settings");
  const tAuth = useTranslations("auth");
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email });
  }, [user, reset]);

  const onSubmit = handleSubmit((values) => {
    setSaved(false);
    updateUser.mutate(values, {
      onSuccess: (updated) => {
        reset({ name: updated.name, email: updated.email });
        setSaved(true);
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          for (const [field, messages] of Object.entries(error.fieldErrors)) {
            const first = messages[0];
            if (first && (field === "name" || field === "email")) {
              setError(field, { message: first });
            }
          }
        }
      },
    });
  });

  if (!user) {
    return <div className="h-40 w-full max-w-md animate-pulse rounded-card bg-surface" />;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-5" noValidate>
      <Field label={tAuth("name")} htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
      </Field>

      <Field label={tAuth("email")} htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={updateUser.isPending} disabled={!isDirty}>
          {t("save")}
        </Button>
        {saved && !isDirty ? <p className="text-teal text-xs">{t("saved")}</p> : null}
      </div>
    </form>
  );
}
