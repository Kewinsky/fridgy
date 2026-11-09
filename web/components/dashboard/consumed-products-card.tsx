"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { AddMissingItemsButton } from "@/components/dashboard/add-missing-items-button";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { localizeDemoProduct } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";

export function ConsumedProductsCard() {
  const t = useTranslations("Dashboard");
  const locale = useLocale() as Locale;
  const { products } = useDashboardData();
  const consumed = products.filter((product) => product.status === "consumed").slice(0, 5);

  return (
    <section className="app-card min-w-0 p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">{t("consumedEyebrow")}</p>
      <h2 className="mt-1 text-xl font-extrabold">{t("consumedTitle")}</h2>
      {consumed.length ? (
        <ul className="mt-4 divide-y divide-border">
          {consumed.map((product) => (
            <li key={product.id} className="flex min-w-0 flex-wrap items-center justify-between gap-2 py-2">
              <span className="min-w-0 break-words text-sm font-semibold">{localizeDemoProduct(product, locale).name}</span>
              <AddMissingItemsButton names={[localizeDemoProduct(product, locale).name]} label={t("addToShopping")} className="h-9 shrink-0 px-3 text-xs" />
            </li>
          ))}
        </ul>
      ) : <p className="mt-4 text-sm text-muted-foreground">{t("consumedEmpty")}</p>}
      <Link href="/dashboard/zapasy" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring">{t("viewAll")} <ArrowRightIcon className="size-4" aria-hidden="true" /></Link>
    </section>
  );
}
