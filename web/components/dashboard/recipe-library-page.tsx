"use client";

import Link from "next/link";
import {
  BookOpenIcon,
  HeartIcon,
  HistoryIcon,
  UtensilsIcon,
} from "lucide-react";

import { AddRecipeDialog } from "@/components/dashboard/add-recipe-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecipeCard } from "@/components/dashboard/recipe-card";
import { useRecipeLibrary } from "@/components/dashboard/use-recipe-library";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { demoRecipes, type Recipe } from "@/lib/demo-recipes";
import { getFavoriteCuisine } from "@/lib/recipe-library";

export function RecipeLibraryPage() {
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

  return (
    <>
      <PageHeader
        eyebrow="Twoja książka kucharska"
        title="Moje przepisy"
        description="Zapisuj ulubione dania, dodawaj własne przepisy i wracaj do historii gotowania."
        actions={<AddRecipeDialog />}
      />

      <section
        aria-label="Podsumowanie przepisów"
        className="mb-6 grid gap-3 sm:grid-cols-3"
      >
        <Metric
          icon={HistoryIcon}
          value={`${library.history.length}`}
          label="wszystkich ugotowań"
        />
        <Metric
          icon={HeartIcon}
          value={`${favoriteRecipes.length}`}
          label="ulubionych przepisów"
        />
        <Metric
          icon={UtensilsIcon}
          value={getFavoriteCuisine(library)}
          label="najczęstsza kuchnia"
        />
      </section>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="favorites">
            <HeartIcon aria-hidden="true" /> Ulubione
          </TabsTrigger>
          <TabsTrigger value="custom">
            <BookOpenIcon aria-hidden="true" /> Moje
          </TabsTrigger>
          <TabsTrigger value="history">
            <HistoryIcon aria-hidden="true" /> Historia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites">
          {favoriteRecipes.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {favoriteRecipes.map((recipe) => (
                <RecipeCard key={recipe.slug} recipe={recipe} variant="library" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={HeartIcon}
              title="Brak ulubionych"
              description="Dodaj sercem przepisy, do których chcesz szybko wracać."
            />
          )}
        </TabsContent>

        <TabsContent value="custom">
          {library.customRecipes.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {library.customRecipes.map((recipe) => (
                <RecipeCard key={recipe.slug} recipe={recipe} variant="library" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpenIcon}
              title="Nie masz jeszcze własnych przepisów"
              description="Dodaj rodzinny przepis albo danie, które chcesz zachować."
              actionNode={<AddRecipeDialog />}
            />
          )}
        </TabsContent>

        <TabsContent value="history">
          {historyRecipes.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {historyRecipes.map((recipe) => (
                <RecipeCard key={recipe.slug} recipe={recipe} variant="library" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={HistoryIcon}
              title="Historia jest jeszcze pusta"
              description="Otwórz przepis i wybierz „Gotuj!”, aby zapisać pierwsze przygotowanie."
              href="/dashboard/co-ugotowac"
              action="Znajdź przepis"
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
