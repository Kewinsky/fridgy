"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CheckIcon, ChevronDownIcon, LanguagesIcon } from "lucide-react";

import { changeLocale } from "@/app/locale-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  defaultLocale,
  isLocale,
  localeNames,
  locales,
} from "@/i18n/config";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const currentValue = useLocale();
  const currentLocale = isLocale(currentValue) ? currentValue : defaultLocale;
  const t = useTranslations("Common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function selectLocale(locale: (typeof locales)[number]) {
    startTransition(async () => {
      await changeLocale(locale);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pending}
        render={
          <Button
            type="button"
            variant="outline"
            size={compact ? "icon-lg" : "default"}
            className={compact ? "size-11" : "h-11"}
            aria-label={t("changeLanguage")}
          >
            <LanguagesIcon aria-hidden="true" />
            {compact ? null : localeNames[currentLocale]}
            {compact ? null : <ChevronDownIcon aria-hidden="true" />}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-44">
        {locales.map((locale) => (
          <DropdownMenuItem key={locale} onClick={() => selectLocale(locale)}>
            <span className="flex-1">{localeNames[locale]}</span>
            {locale === currentLocale ? <CheckIcon aria-hidden="true" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
