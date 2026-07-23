"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { CheckIcon, SpinnerIcon } from "@/components/icons";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { type Locale, locales } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";

const endonyms: Record<Locale, string> = {
  id: "Indonesia",
  en: "English",
};

export function LanguageSwitcher() {
  const active = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const choose = (next: Locale) => () => {
    if (next === active) return;
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  };

  return (
    <>
      {locales.map((locale) => (
        <DropdownMenuItem key={locale} onSelect={choose(locale)} disabled={isPending}>
          <span className="flex w-4 justify-center text-brass">
            {isPending && locale !== active ? (
              <SpinnerIcon size={14} />
            ) : locale === active ? (
              <CheckIcon size={14} />
            ) : null}
          </span>
          {endonyms[locale]}
        </DropdownMenuItem>
      ))}
    </>
  );
}
