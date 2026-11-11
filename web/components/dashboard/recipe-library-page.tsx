"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  HeartIcon,
  HistoryIcon,
  SearchIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { AddRecipeDialog } from "@/components/dashboard/add-recipe-dialog";
import { BrandIcon } from "@/components/brand-icon";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecipeCard } from "@/components/dashboard/recipe-card";
import { useRecipeLibrary } from "@/components/dashboard/use-recipe-library";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsScrollableList, TabsTrigger } from "@/components/ui/tabs";
import type { Recipe } from "@/lib/demo-recipes";
import { localizeDemoRecipe } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";
import { getHistoryRecipes } from "@/lib/recipe-library";
import { daysUntilRecipePruned } from "@/lib/recipe-retention";

type RecipeLibraryTab = "favorites" | "custom" | "history";

export function RecipeLibraryPage() {
  const t = useTranslations("RecipeLibrary");
  const { isHouseholdOwner } = useDashboardData();
  const [query, setQuery] = useState("");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={isHouseholdOwner ? <AddRecipeDialog /> : null}
      />

      <Tabs defaultValue="favorites">
        <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-center lg:justify-between">
          <label className="relative block w-full lg:w-80 lg:shrink-0">
            <span className="sr-only">{t("search")}</span>
            <SearchIcon className="absolute left-3 top-3 size-5 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-11 pl-10"
            />
          </label>
          <div className="min-w-0">
            <TabsScrollableList>
              <TabsTrigger value="favorites" className="h-9 px-3">
                <HeartIcon aria-hidden="true" /> {t("tabs.favorites")}
              </TabsTrigger>
              <TabsTrigger value="custom" className="h-9 px-3">
                <BookOpenIcon aria-hidden="true" /> {t("tabs.custom")}
              </TabsTrigger>
              <TabsTrigger value="history" className="h-9 px-3">
                <HistoryIcon aria-hidden="true" /> {t("tabs.history")}
              </TabsTrigger>
            </TabsScrollableList>
          </div>
        </div>

        <TabsContent value="favorites" className="pt-3">
          <RecipeLibraryCards tab="favorites" query={query} />
        </TabsContent>

        <TabsContent value="custom" className="pt-3">
          <RecipeLibraryCards tab="custom" query={query} />
        </TabsContent>

        <TabsContent value="history" className="pt-3">
          <p className="mb-3 text-sm text-muted-foreground">{t("historyRetention")}</p>
          <RecipeLibraryCards tab="history" query={query} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function RecipeLibraryCards({ tab, query }: { tab: RecipeLibraryTab; query: string }) {
  const t = useTranslations("RecipeLibrary");
  const locale = useLocale() as Locale;
  const library = useRecipeLibrary();
  const { recipes: savedRecipes, isHouseholdOwner } = useDashboardData();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    if (tab !== "history") return;
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [tab]);
  const allRecipes = savedRecipes;
  let recipes: Recipe[];
  let emptyState: ReactNode;

  if (tab === "favorites") {
    recipes = allRecipes.filter((recipe) => library.favoriteSlugs.includes(recipe.slug));
    emptyState = <EmptyState icon="empty_state" title={t("emptyFavorites.title")} description={t("emptyFavorites.description")} />;
  } else if (tab === "custom") {
    recipes = savedRecipes.filter((recipe) => recipe.source === "custom");
    emptyState = <EmptyState icon="empty_state" title={t("emptyCustom.title")} description={t("emptyCustom.description")} actionNode={isHouseholdOwner ? <AddRecipeDialog /> : undefined} />;
  } else {
    recipes = getHistoryRecipes(savedRecipes, [], library.history);
    emptyState = <EmptyState icon="cooking_recipe" title={t("emptyHistory.title")} description={t("emptyHistory.description")} href="/dashboard/co-ugotowac" action={t("emptyHistory.action")} />;
  }

  const search = query.trim().toLocaleLowerCase(locale);
  if (search) {
    recipes = recipes.filter((recipe) => {
      const displayRecipe = localizeDemoRecipe(recipe, locale);
      return [displayRecipe.title, displayRecipe.description, ...displayRecipe.ingredients.map((ingredient) => ingredient.name)]
        .some((value) => value.toLocaleLowerCase(locale).includes(search));
    });
  }

  if (search && !recipes.length) {
    return <EmptyState icon="empty_state" title={t("noSearchResults.title")} description={t("noSearchResults.description")} />;
  }
  if (!recipes.length) return emptyState;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {recipes.map((recipe) => {
        let expiryDays: number | null = null;
        if (tab === "history" && now && "source" in recipe && recipe.source === "ai"
          && "createdAt" in recipe && typeof recipe.createdAt === "string"
          && !library.favoriteSlugs.includes(recipe.slug)) {
          expiryDays = daysUntilRecipePruned(recipe.createdAt, now);
        }
        return <RecipeCard key={recipe.slug} recipe={recipe} variant="library" expiryDays={expiryDays} />;
      })}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  href,
  action,
  actionNode,
}: {
  icon: "empty_state" | "cooking_recipe";
  title: string;
  description: string;
  href?: string;
  action?: string;
  actionNode?: React.ReactNode;
}) {
  return (
    <section className="app-card px-5 py-12 text-center">
      <BrandIcon name={icon} className="mx-auto size-20" />
      <h2 className="mt-4 text-lg font-extrabold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {href && action ? (
        <Button
          nativeButton={false}
          render={<Link href={href} />}
          className="mt-5 h-11"
        >
          {action}
        </Button>
      ) : null}
      {actionNode ? (
        <div className="mt-5 flex justify-center">{actionNode}</div>
      ) : null}
    </section>
  );
}
