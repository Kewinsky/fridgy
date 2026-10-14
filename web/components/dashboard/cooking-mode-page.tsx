"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeftIcon, ChefHatIcon, ClockIcon, UsersIcon } from "lucide-react";

import { FinishCookingDialog } from "@/components/dashboard/finish-cooking-dialog";
import { cuisineMessageKeys, isCuisine } from "@/components/dashboard/recipe-options";
import { useRecipeLibrary } from "@/components/dashboard/use-recipe-library";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { demoRecipes } from "@/lib/demo-recipes";
import { localizeDemoRecipe } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function CookingModePage({ slug }: { slug: string }) {
  const t = useTranslations("CookingMode");
  const recipeT = useTranslations("Recipe");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const library = useRecipeLibrary();
  const sourceRecipe = demoRecipes.find((item) => item.slug === slug)
    ?? library.customRecipes.find((item) => item.slug === slug);
  const recipe = sourceRecipe ? localizeDemoRecipe(sourceRecipe, locale) : undefined;
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => new Set());

  if (!recipe) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <h1 className="text-2xl font-extrabold">{t("notFound")}</h1>
        <Button className="mt-5 h-11" onClick={() => router.push("/dashboard/moje-przepisy")}>{recipeT("back")}</Button>
      </div>
    );
  }

  function toggleStep(index: number) {
    setCompletedSteps((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" className="h-11" onClick={() => router.back()}>
          <ArrowLeftIcon aria-hidden="true" /> {t("exit")}
        </Button>
        <p className="text-sm font-semibold text-muted-foreground">
          {t("progress", { completed: completedSteps.size, total: recipe.steps.length })}
        </p>
      </header>

      <main>
        <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
          <ChefHatIcon aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{recipe.title}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary"><ClockIcon aria-hidden="true" /> {recipeT("minutes", { count: recipe.time })}</Badge>
          <Badge variant="outline"><UsersIcon aria-hidden="true" /> {recipeT("servings", { count: recipe.servings })}</Badge>
          <Badge variant="outline">{isCuisine(recipe.cuisine) ? recipeT(`cuisineOptions.${cuisineMessageKeys[recipe.cuisine]}`) : recipe.cuisine}</Badge>
        </div>

        <section className="app-card mt-8 p-5 sm:p-6">
          <h2 className="text-xl font-extrabold">{recipeT("ingredients")}</h2>
          <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={`${index}-${ingredient.name}`} className="flex items-baseline justify-between gap-3 border-b border-border pb-2 text-sm">
                <span className="font-semibold">{ingredient.name}</span>
                <span className="text-muted-foreground">{ingredient.amount}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-extrabold">{recipeT("preparation")}</h2>
          <ol className="mt-4 space-y-3">
            {recipe.steps.map((step, index) => {
              const checked = completedSteps.has(index);
              return (
                <li key={`${index}-${step}`}>
                  <label className={cn(
                    "app-card flex min-h-20 cursor-pointer items-start gap-4 p-4 transition-colors hover:bg-muted/60",
                    checked && "bg-muted text-muted-foreground",
                  )}>
                    <Checkbox checked={checked} onCheckedChange={() => toggleStep(index)} aria-label={t("stepCompleted", { number: index + 1 })} className="mt-0.5" />
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-extrabold text-primary">{index + 1}</span>
                    <span className={cn("text-sm leading-6", checked && "line-through")}>{step}</span>
                  </label>
                </li>
              );
            })}
          </ol>
        </section>

        <FinishCookingDialog recipe={recipe} />
      </main>
    </div>
  );
}
