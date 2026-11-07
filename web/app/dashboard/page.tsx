import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRightIcon,
  ChefHatIcon,
  Clock3Icon,
  PackagePlusIcon,
} from "lucide-react";

import { FreshnessLabel } from "@/components/dashboard/freshness-label";
import { ProductVisual } from "@/components/dashboard/product-visual";
import { Button } from "@/components/ui/button";
import { getCurrentDashboard, type DashboardData } from "@/lib/dashboard-data";
import { getFreshnessStatus, type DemoProduct } from "@/lib/demo-data";
import { localizeDemoProduct, localizeDemoRecipe, localizeStarterShoppingItem } from "@/lib/demo-localization";
import { demoRecipes, recipeAllergens, type Recipe } from "@/lib/demo-recipes";
import { matchRecipeToInventory } from "@/lib/inventory-store";
import { getRecipeImageSrc } from "@/lib/recipe-image";
import { getRecipePreferenceConflicts } from "@/lib/recipe-preferences";
import type { ShoppingItem } from "@/lib/shopping-list";
import type { Locale } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const recipeT = await getTranslations("Recipe");
  const allergenT = await getTranslations("Recipe.allergens.options");
  const inventoryT = await getTranslations("Inventory");
  const locale = await getLocale() as Locale;
  const { initialData } = await getCurrentDashboard();
  const activeProducts = initialData.products.filter((product) => product.status === "active");
  const inventoryPreview = [...activeProducts].sort((first, second) => first.estimatedUseBy.localeCompare(second.estimatedUseBy));
  const deadlines = activeProducts.map((product) => ({
    product,
    status: getFreshnessStatus(product.estimatedUseBy),
  }));
  const priorityProducts = deadlines
    .filter((item) => item.status === "today" || item.status === "soon")
    .sort((first, second) => first.product.estimatedUseBy.localeCompare(second.product.estimatedUseBy))
    .map((item) => item.product);
  const pendingShopping = initialData.shoppingItems.filter((item) => !item.done);
  const usableProducts = deadlines.filter((item) => item.status !== "overdue").map((item) => item.product);
  const allergenLabels = Object.fromEntries(recipeAllergens.map((allergen) => [allergen, allergenT(allergen)]));
  const suggestion = chooseRecipe(usableProducts, priorityProducts, initialData, locale, allergenLabels);
  const displayRecipe = suggestion ? localizeDemoRecipe(suggestion, locale) : null;
  const imageSrc = suggestion ? getRecipeImageSrc(suggestion) : null;
  const hasProducts = activeProducts.length > 0;

  return (
    <div className="space-y-5 pb-6">
      <section className="relative isolate overflow-hidden rounded-2xl bg-surface-strong p-6 text-surface-strong-foreground sm:p-8 xl:p-10">
          <div className="strong-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.8fr)] lg:items-center">
            <div className="max-w-xl">
              <p className="text-sm font-bold text-surface-strong-accent">{t("eyebrow")}</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl xl:text-5xl">{t("title")}</h1>
              <p className="mt-4 max-w-md leading-7 text-surface-strong-foreground/80">{t("description")}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button nativeButton={false} render={<Link href={hasProducts ? "/dashboard/co-ugotowac" : "/dashboard/dodaj-produkty"} />} className="h-11 bg-surface-strong-foreground px-5 text-surface-strong hover:bg-surface-strong-foreground/90">
                  {hasProducts ? <ChefHatIcon aria-hidden="true" /> : <PackagePlusIcon aria-hidden="true" />}
                  {hasProducts ? t("cookNow") : t("addReceipt")}
                  <ArrowRightIcon aria-hidden="true" />
                </Button>
                {hasProducts ? (
                  <Button nativeButton={false} render={<Link href="/dashboard/dodaj-produkty" />} variant="outline" className="h-11 border-surface-strong-foreground/30 bg-transparent px-5 text-surface-strong-foreground hover:bg-surface-strong-foreground/10 hover:text-surface-strong-foreground">
                    <PackagePlusIcon aria-hidden="true" /> {t("addReceipt")}
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="rounded-2xl border border-surface-strong-foreground/15 bg-surface-strong-foreground/10 p-4 sm:p-5">
              {suggestion && displayRecipe ? (
                <>
                  <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl bg-surface-strong-foreground/10">
                    {imageSrc ? <Image src={imageSrc} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" /> : <ChefHatIcon className="size-9 text-surface-strong-accent" aria-hidden="true" />}
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-surface-strong-accent">{t("recipeEyebrow")}</p>
                  <h2 className="mt-1 text-xl font-extrabold">{displayRecipe.title}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-surface-strong-foreground/80">
                    <Clock3Icon className="size-4" aria-hidden="true" />
                    {recipeT("minutes", { count: suggestion.time })}
                  </p>
                  <Button nativeButton={false} render={<Link href={`/dashboard/co-ugotowac/${suggestion.slug}`} />} variant="outline" className="mt-4 h-11 w-full border-surface-strong-foreground/30 bg-transparent text-surface-strong-foreground hover:bg-surface-strong-foreground/10 hover:text-surface-strong-foreground">
                    {recipeT("viewRecipe")} <ArrowRightIcon aria-hidden="true" />
                  </Button>
                </>
              ) : (
                <div className="flex min-h-64 flex-col items-start justify-center">
                  <ChefHatIcon className="size-9 text-surface-strong-accent" aria-hidden="true" />
                  <h2 className="mt-4 text-xl font-extrabold">{t("recipeFallbackTitle")}</h2>
                  <Button nativeButton={false} render={<Link href="/dashboard/co-ugotowac" />} variant="outline" className="mt-5 h-11 border-surface-strong-foreground/30 bg-transparent text-surface-strong-foreground hover:bg-surface-strong-foreground/10 hover:text-surface-strong-foreground">
                    {t("cookNow")} <ArrowRightIcon aria-hidden="true" />
                  </Button>
                </div>
              )}
            </div>
          </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <ProductPreview
          products={inventoryPreview}
          eyebrow={t("allProductsEyebrow")}
          title={inventoryT("metaTitle")}
          viewAll={t("viewAll")}
          more={inventoryPreview.length > 5 ? t("moreProducts", { count: inventoryPreview.length - 5 }) : undefined}
          empty={t("allProductsEmpty")}
          locale={locale}
        />
        <ShoppingPreview
          items={pendingShopping}
          eyebrow={t("shoppingEyebrow")}
          title={t("shoppingPreview")}
          empty={t("shoppingEmpty")}
          more={pendingShopping.length > 5 ? t("moreShopping", { count: pendingShopping.length - 5 }) : undefined}
          viewAll={t("viewAll")}
          locale={locale}
        />
      </div>
    </div>
  );
}

function ShoppingPreview({
  items,
  eyebrow,
  title,
  empty,
  more,
  viewAll,
  locale,
}: {
  items: ShoppingItem[];
  eyebrow: string;
  title: string;
  empty: string;
  more?: string;
  viewAll: string;
  locale: Locale;
}) {
  return (
    <section className="app-card flex min-w-0 flex-col p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-extrabold">{title}</h2>
      {items.length ? (
        <ul className="mt-4 flex-1 divide-y divide-border">
          {items.slice(0, 5).map((item) => (
            <li key={item.id} className="flex min-h-11 items-center gap-3 py-2 text-sm font-semibold">
              <span className="size-2 shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
              <span className="min-w-0 truncate">{localizeStarterShoppingItem(item, locale).name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex-1 py-8 text-sm text-muted-foreground">{empty}</p>
      )}
      {more ? <p className="mt-2 text-xs text-muted-foreground">{more}</p> : null}
      <Link href="/dashboard/lista-zakupow" className="mt-4 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring">
        {viewAll} <ArrowRightIcon className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

function ProductPreview({
  products,
  eyebrow,
  title,
  viewAll,
  more,
  empty,
  locale,
}: {
  products: DemoProduct[];
  eyebrow: string;
  title: string;
  viewAll: string;
  more?: string;
  empty?: string;
  locale: Locale;
}) {
  return (
    <section className="app-card p-5 sm:p-6 lg:col-span-2">
      <SectionHeading eyebrow={eyebrow} title={title} href="/dashboard/zapasy" viewAll={viewAll} />
      {products.length ? (
        <ul className="mt-5 grid gap-x-5 divide-y divide-border xl:grid-cols-2 xl:divide-y-0">
          {products.slice(0, 5).map((product) => (
            <li key={product.id} className="xl:border-b xl:border-border">
              <Link href="/dashboard/zapasy" className="group flex min-w-0 items-center gap-3 rounded-lg py-3 transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring sm:px-2">
                <ProductVisual category={product.category} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold group-hover:text-primary">{localizeDemoProduct(product, locale).name}</span>
                  <FreshnessLabel date={product.estimatedUseBy} />
                </span>
                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-8 text-sm text-muted-foreground">{empty}</p>
      )}
      {more ? <p className="mt-3 border-t border-border pt-4 text-sm text-muted-foreground">{more}</p> : null}
    </section>
  );
}

function SectionHeading({ eyebrow, title, href, viewAll }: { eyebrow: string; title: string; href: string; viewAll: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-extrabold">{title}</h2>
      </div>
      <Link href={href} className="flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring">
        {viewAll} <ArrowRightIcon className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function chooseRecipe(
  usableProducts: DemoProduct[],
  priorityProducts: DemoProduct[],
  preferences: Pick<DashboardData, "diet" | "allergies" | "excludedIngredients">,
  locale: Locale,
  allergenLabels: Record<string, string>,
) {
  return demoRecipes
    .filter((recipe) => {
      const versions = [recipe, localizeDemoRecipe(recipe, locale)];
      return versions.every((version) => {
        const conflicts = getRecipePreferenceConflicts(version, preferences, allergenLabels);
        return !conflicts.dietConflict && !conflicts.matchingAllergens.length && !conflicts.matchingIngredients.length;
      });
    })
    .map((recipe) => {
      const available = countAvailable(recipe, usableProducts);
      const priority = countAvailable(recipe, priorityProducts);
      return { recipe, available, score: priority * 2 + available };
    })
    .sort((first, second) => second.score - first.score || first.recipe.time - second.recipe.time)[0]?.recipe;
}

function countAvailable(recipe: Recipe, products: DemoProduct[]) {
  return matchRecipeToInventory(recipe, products).ingredients.filter((ingredient) => ingredient.available).length;
}
