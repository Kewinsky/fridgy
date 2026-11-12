import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRightIcon,
  ChefHatIcon,
  PackagePlusIcon,
} from "lucide-react";

import { ConsumedProductsCard } from "@/components/dashboard/consumed-products-card";
import { BrandIcon } from "@/components/brand-icon";
import { ProductRowDetails } from "@/components/dashboard/product-row-details";
import { OnboardingSteps } from "@/components/dashboard/household-onboarding";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentDashboard, type DashboardData } from "@/lib/dashboard-data";
import { getDailyIdea } from "@/lib/daily-idea";
import { getFreshnessStatus } from "@/lib/demo-data";
import type { Locale } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const locale = await getLocale() as Locale;
  const dashboard = await getCurrentDashboard();
  if (!dashboard) return null;
  const { initialData, householdName, onboardingFinished } = dashboard;
  const activeProducts = initialData.products.filter((product) => product.status === "active");
  const expiringProducts = activeProducts.map((product) => ({
    product,
    status: getFreshnessStatus(product.estimatedUseBy),
  })).filter(({ status }) => {
    return status === "today" || status === "soon" || status === "week";
  }).sort((first, second) => first.product.estimatedUseBy.localeCompare(second.product.estimatedUseBy));
  const overdueCount = activeProducts.filter((product) => getFreshnessStatus(product.estimatedUseBy) === "overdue").length;
  const hasProducts = activeProducts.length > 0;
  const hasAddedProducts = initialData.products.some((product) => !product.isDemo);
  const hasCooked = initialData.recipeLibrary.history.length > 0;
  const shouldAddProducts = !hasProducts || (!onboardingFinished && !hasAddedProducts);

  return (
    <div className="space-y-5 pb-6">
      <section className="relative isolate overflow-hidden rounded-2xl bg-surface-strong p-6 text-surface-strong-foreground sm:p-8 xl:p-10">
          <div className="strong-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.8fr)] lg:items-center">
            <div className="max-w-xl">
              <p className="text-sm font-bold text-surface-strong-accent">{t("householdEyebrow")}</p>
              <h1 className="mt-3 break-words text-3xl font-extrabold tracking-tight text-balance sm:text-4xl xl:text-5xl">{t("householdTitle", { name: householdName })}</h1>
              <p className="mt-4 max-w-md leading-7 text-surface-strong-foreground/80">{t("description")}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button nativeButton={false} render={<Link href={shouldAddProducts ? "/dashboard/dodaj-produkty" : "/dashboard/co-ugotowac"} />} className="h-11 bg-surface-strong-foreground px-5 text-surface-strong hover:bg-surface-strong-foreground/90">
                  {shouldAddProducts ? <PackagePlusIcon aria-hidden="true" /> : <ChefHatIcon aria-hidden="true" />}
                  {shouldAddProducts ? t("addReceipt") : t("cookNow")}
                  <ArrowRightIcon aria-hidden="true" />
                </Button>
                {hasProducts && !shouldAddProducts ? (
                  <Button nativeButton={false} render={<Link href="/dashboard/dodaj-produkty" />} variant="outline" className="h-11 border-surface-strong-foreground/30 bg-transparent px-5 text-surface-strong-foreground hover:bg-surface-strong-foreground/10 hover:text-surface-strong-foreground">
                    <PackagePlusIcon aria-hidden="true" /> {t("addReceipt")}
                  </Button>
                ) : null}
              </div>
            </div>
            {!onboardingFinished ? (
              <OnboardingSteps hasHousehold hasProducts={hasAddedProducts} hasCooked={hasCooked} />
            ) : <Suspense fallback={
              <section className="flex min-h-64 min-w-0 flex-col rounded-2xl border border-surface-strong-foreground/15 bg-surface-strong-foreground/10 p-5 sm:p-6" aria-busy="true">
                <p className="sr-only" role="status">{t("dailyLoading")}</p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-surface-strong-accent">{t("dailyEyebrow")}</p>
                <h2 className="mt-1 text-xl font-extrabold">{t("dailyTitle")}</h2>
                <div className="mt-5 space-y-3" aria-hidden="true">
                  <Skeleton className="h-6 w-4/5 max-w-72 bg-surface-strong-foreground/15" />
                  <Skeleton className="h-4 w-full bg-surface-strong-foreground/15" />
                  <Skeleton className="h-4 w-2/3 bg-surface-strong-foreground/15" />
                  <Skeleton className="mt-5 h-4 w-36 bg-surface-strong-foreground/15" />
                  <Skeleton className="mt-5 h-5 w-28 bg-surface-strong-foreground/15" />
                </div>
              </section>
            }>
              <DailyIdeaCard dashboard={initialData} locale={locale} />
            </Suspense>}
          </div>
      </section>

      <section aria-label={t("snapshotTitle")} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)]">
        <div className="app-card min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{t("expiringEyebrow")}</p>
              <h2 className="mt-1 text-xl font-extrabold">{t("expiringTitle")}</h2>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold tabular-nums text-primary" aria-label={`${expiringProducts.length} ${t("expiringCountLabel")}`}>{expiringProducts.length}</span>
          </div>
          {expiringProducts.length ? (
            <ul className="divide-y divide-border px-5 sm:px-6">
              {expiringProducts.slice(0, 5).map(({ product }) => (
                <li key={product.id} className="flex min-w-0 items-center gap-3 py-3.5 sm:gap-4">
                  <ProductRowDetails product={product} />
                </li>
              ))}
            </ul>
          ) : <p className="px-5 py-5 text-sm text-muted-foreground sm:px-6">{t("expiringEmpty")}</p>}
          {overdueCount > 0 ? <p className="px-5 pb-3 text-sm text-destructive sm:px-6">{t("overdueNotice", { count: overdueCount })}</p> : null}
          <Link href="/dashboard/zapasy" className="flex min-h-12 items-center gap-2 border-t border-border px-5 text-sm font-semibold text-primary transition-colors hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-ring sm:px-6">{t("viewAll")} <ArrowRightIcon className="size-4" aria-hidden="true" /></Link>
        </div>

        <ConsumedProductsCard />
      </section>
    </div>
  );
}

async function DailyIdeaCard({ dashboard, locale }: { dashboard: DashboardData; locale: Locale }) {
  const t = await getTranslations("Dashboard");
  const recipeT = await getTranslations("Recipe");
  const idea = await getDailyIdea(dashboard, locale);

  return (
    <section className="flex min-h-64 min-w-0 flex-col rounded-2xl border border-surface-strong-foreground/15 bg-surface-strong-foreground/10 p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-surface-strong-accent">{t("dailyEyebrow")}</p>
          <h2 className="mt-1 text-xl font-extrabold">{t("dailyTitle")}</h2>
        </div>
        {idea.status === "ready" ? <BrandIcon name="cooking_recipe" className="size-14" /> : null}
      </div>
      {idea.status === "ready" ? (
        <>
          <h3 className="mt-4 text-lg font-bold">{idea.recipe.title}</h3>
          <p className="mt-2 text-sm leading-6 text-surface-strong-foreground/80">{idea.recipe.description}</p>
          <p className="mt-3 text-xs font-semibold text-surface-strong-foreground/70">{recipeT("minutes", { count: idea.recipe.time })} · {recipeT("servings", { count: idea.recipe.servings })}</p>
          <Link href={`/dashboard/moje-przepisy/${idea.recipe.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-surface-strong-accent hover:underline focus-visible:outline-2 focus-visible:outline-ring">{recipeT("viewRecipe")} <ArrowRightIcon className="size-4" aria-hidden="true" /></Link>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm leading-6 text-surface-strong-foreground/80">{t(`dailyStatus.${idea.status}`)}</p>
          {idea.status === "empty" ? <Link href="/dashboard/dodaj-produkty" className="mt-4 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-surface-strong-accent hover:underline focus-visible:outline-2 focus-visible:outline-ring">{t("addReceipt")} <ArrowRightIcon className="size-4" aria-hidden="true" /></Link> : null}
        </>
      )}
    </section>
  );
}
