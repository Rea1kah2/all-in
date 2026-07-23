"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/features/auth/use-auth";
import { ApiError } from "@/lib/api";
import { type RegisterInput, registerSchema } from "@/types/auth";

const fieldNames = ["name", "email", "password", "password_confirmation"] as const;

type FieldName = (typeof fieldNames)[number];

function isFieldName(value: string): value is FieldName {
  return fieldNames.includes(value as FieldName);
}

export function RegisterForm() {
  const registerUser = useRegister();
  const t = useTranslations("auth");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    registerUser.mutate(values, {
      onError: (error) => {
        if (error instanceof ApiError) {
          for (const [field, messages] of Object.entries(error.fieldErrors)) {
            const first = messages[0];
            if (first && isFieldName(field)) {
              setError(field, { message: first });
            }
          }
        }
      },
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-1">
        <h1 className="text-xl text-ink">{t("registerTitle")}</h1>
        <p className="text-sm text-ink-muted">{t("registerSubtitle")}</p>
      </div>

      <Field label={t("name")} htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
      </Field>

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
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </Field>

      <Field
        label={t("passwordConfirm")}
        htmlFor="password_confirmation"
        error={errors.password_confirmation?.message}
      >
        <Input
          id="password_confirmation"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password_confirmation)}
          {...register("password_confirmation")}
        />
      </Field>

      <Button type="submit" className="w-full" loading={registerUser.isPending}>
        {registerUser.isPending ? t("processing") : t("submitRegister")}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-teal hover:underline">
          {t("toLogin")}
        </Link>
      </p>
    </form>
  );
}
