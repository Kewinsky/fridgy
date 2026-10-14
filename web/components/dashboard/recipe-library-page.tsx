"use client";

import Link from "next/link";
import {
  BookOpenIcon,
  HeartIcon,
  HistoryIcon,
  UtensilsIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { AddRecipeDialog } from "@/components/dashboard/add-recipe-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecipeCard } from "@/components/dashboard/recipe-card";
import { useRecipeLibrary } from "@/components/dashboard/use-recipe-library";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsScrollableList, TabsTrigger } from "@/components/ui/tabs";
import { demoRecipes, type Recipe } from "@/lib/demo-recipes";
import { getFavoriteCuisine } from "@/lib/recipe-library";
import { cuisineMessageKeys, isCuisine } from "@/components/dashboard/recipe-options";

export function RecipeLibraryPage() {
  const t = useTranslations("RecipeLibrary");
  const recipeT = useTranslations("Recipe");
  const library = useRecipeLibrary();
  const allRecipes = [...library.customRecipes, ...demoRecipes];
  const favoriteRecipes = allRecipes.filter((recipe) =>
    library.favoriteSlugs.includes(recipe.slug),
  );
  const historyRecipes = Array.from(
    new Set(library.history.map((record) => record.recipeSlug)),
  )
    .map((slug) => allRecipes.find((recipe) => recipe.slug === slug))
    .filter((recipe): recipe is Recipe => recipe !== undefined);
  const favoriteCuisine = getFavoriteCuisine(library);
  const favoriteCuisineLabel = isCuisine(favoriteCuisine)
    ? recipeT(`cuisineOptions.${cuisineMessageKeys[favoriteCuisine]}`)
    : t("noData");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={<AddRecipeDialog />}
      />

      <section
        aria-label={t("summary")}
        className="mb-6 grid gap-3 sm:grid-cols-3"
      >
        <Metric
          icon={HistoryIcon}
          value={`${library.history.length}`}
          label={t("allCookings")}
        />
        <Metric
          icon={HeartIcon}
          value={`${favoriteRecipes.length}`}
          label={t("favoriteRecipes")}
        />
        <Metric
          icon={UtensilsIcon}
          value={favoriteCuisineLabel}
          label={t("favoriteCuisine")}
        />
      </section>

      <Tabs defaultValue="history">
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

        <TabsContent value="favorites" className="pt-3">
          {favoriteRecipes.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {favoriteRecipes.map((recipe) => (
                <RecipeCard key={recipe.slug} recipe={recipe} variant="library" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={HeartIcon}
              title={t("emptyFavorites.title")}
              description={t("emptyFavorites.description")}
            />
          )}
        </TabsContent>

        <TabsContent value="custom" className="pt-3">
          {library.customRecipes.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {library.customRecipes.map((recipe) => (
                <RecipeCard key={recipe.slug} recipe={recipe} variant="library" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpenIcon}
              title={t("emptyCustom.title")}
              description={t("emptyCustom.description")}
              actionNode={<AddRecipeDialog />}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="pt-3">
          {historyRecipes.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {historyRecipes.map((recipe) => (
                <RecipeCard key={recipe.slug} recipe={recipe} variant="library" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={HistoryIcon}
              title={t("emptyHistory.title")}
              description={t("emptyHistory.description")}
              href="/dashboard/co-ugotowac"
              action={t("emptyHistory.action")}
            />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof HistoryIcon;
  value: string;
  label: string;
}) {
  return (
    <div className="app-card flex min-h-24 items-center gap-4 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xl font-extrabold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  action,
  actionNode,
}: {
  icon: typeof HistoryIcon;
  title: string;
  description: string;
  href?: string;
  action?: string;
  actionNode?: React.ReactNode;
}) {
  return (
    <section className="app-card px-5 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon aria-hidden="true" />
      </span>
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
