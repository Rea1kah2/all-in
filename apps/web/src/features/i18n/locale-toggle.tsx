"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { type Locale, locales } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";

export function LocaleToggle() {
  const active = useLocale() as Locale;
  const t = useTranslations("language");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const next = locales.find((locale) => locale !== active) ?? active;

  const toggle = () => {
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggle}
      loading={isPending}
      aria-label={t("toggle")}
      className="font-mono uppercase"
    >
      {active}
    </Button>
  );
}
