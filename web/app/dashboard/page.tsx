import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRightIcon,
  LeafIcon,
  ListChecksIcon,
  PackageCheckIcon,
  ScanLineIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FreshnessLabel } from "@/components/dashboard/freshness-label";
import { getFreshnessStatus } from "@/lib/demo-data";
import { localizeDemoProduct } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";
import { loadDashboardData } from "@/lib/dashboard-data";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const locale = await getLocale() as Locale;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return null;
  const { products, shoppingItems } = await loadDashboardData(supabase, auth.claims.sub);
  const activeProducts = products.filter((product) => product.status === "active");
  const expiringProducts = activeProducts.filter((product) =>
    ["overdue", "today", "soon"].includes(getFreshnessStatus(product.estimatedUseBy)),
  ).sort((first, second) => first.estimatedUseBy.localeCompare(second.estimatedUseBy));

  return (
    <>
      <section className="relative overflow-hidden rounded-xl bg-surface-strong p-6 text-surface-strong-foreground sm:p-8">
        <div className="strong-grid absolute inset-0" />
        <div className="relative max-w-xl">
          <p className="text-sm font-bold text-surface-strong-accent">{t("eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{t("title")}</h1>
          <p className="mt-3 text-sm leading-6 text-surface-strong-foreground/75">
            {t("description")}
          </p>
          <Button nativeButton={false} render={<Link href="/dashboard/dodaj-paragon" />} className="mt-6 h-11">
            <ScanLineIcon aria-hidden="true" />
            {t("addReceipt")}
          </Button>
        </div>
      </section>

      <section aria-label={t("summary")} className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric icon={PackageCheckIcon} value={String(activeProducts.length)} label={t("productsAtHome")} />
        <Metric icon={SparklesIcon} value={String(expiringProducts.length)} label={t("useSoon")} />
        <Metric icon={ListChecksIcon} value={String(shoppingItems.filter((item) => !item.done).length)} label={t("shoppingList")} />
      </section>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <section className="app-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{t("first")}</p>
              <h2 className="mt-1 text-xl font-extrabold">{t("worthUsing")}</h2>
            </div>
            <Link href="/dashboard/zapasy" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              {t("view")} <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {expiringProducts.length ? (
            <ul className="mt-5 divide-y divide-border">
              {expiringProducts.slice(0, 5).map((product) => <li key={product.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span className="font-semibold">{localizeDemoProduct(product, locale).name}</span>
                <FreshnessLabel date={product.estimatedUseBy} />
              </li>)}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-fresh-soft text-fresh"><LeafIcon aria-hidden="true" /></span>
              <p className="mt-4 font-bold">{t("emptyTitle")}</p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{t("emptyDescription")}</p>
            </div>
          )}
        </section>

        <section className="app-card p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">{t("firstSteps")}</p>
          <h2 className="mt-1 text-xl font-extrabold">{t("prepareKitchen")}</h2>
          <ol className="mt-5 space-y-4">
            <Step number="1" label={t("stepReceipt")} />
            <Step number="2" label={t("stepProducts")} />
            <Step number="3" label={t("stepCooking")} />
          </ol>
        </section>
      </div>
    </>
  );
}

function Metric({ icon: Icon, value, label }: { icon: typeof LeafIcon; value: string; label: string }) {
  return (
    <div className="app-card flex items-center gap-4 p-4">
      <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xl font-extrabold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Step({ number, label }: { number: string; label: string }) {
  return (
    <li className="flex items-center gap-3 text-sm font-semibold">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-extrabold text-primary">
        {number}
      </span>
      {label}
    </li>
  );
}
