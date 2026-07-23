"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/use-auth";
import { ApiError } from "@/lib/api";
import { type LoginInput, loginSchema } from "@/types/auth";

export function LoginForm() {
  const login = useLogin();
  const t = useTranslations("auth");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onError: (error) => {
        if (error instanceof ApiError) {
          for (const [field, messages] of Object.entries(error.fieldErrors)) {
            const first = messages[0];
            if (first && (field === "email" || field === "password")) {
              setError(field, { message: first });
            }
          }
        }
      },
    });
  });

  const generalError =
    login.error instanceof ApiError && Object.keys(login.error.fieldErrors).length === 0
      ? login.error.message
      : null;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-1">
        <h1 className="text-xl text-ink">{t("loginTitle")}</h1>
        <p className="text-sm text-ink-muted">{t("loginSubtitle")}</p>
      </div>

      <Field label={t("email")} htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <Field label={t("password")} htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </Field>

      {generalError ? (
        <p className="rounded-badge bg-bear-bg px-3 py-2 text-xs text-bear">
          {generalError}
        </p>
      ) : null}

      <Button type="submit" className="w-full" loading={login.isPending}>
        {login.isPending ? t("processing") : t("submitLogin")}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-teal hover:underline">
          {t("toRegister")}
        </Link>
      </p>
    </form>
  );
}
