"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRightIcon,
  ChefHatIcon,
  ClockIcon,
  UsersIcon,
} from "lucide-react";

import {
  DeleteRecipeDialog,
  EditRecipeDialog,
} from "@/components/dashboard/add-recipe-dialog";
import { FavoriteRecipeButton } from "@/components/dashboard/recipe-actions";
import { RecipeImage } from "@/components/dashboard/recipe-image";
import { difficultyMessageKeys } from "@/components/dashboard/recipe-options";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/demo-recipes";
import { localizeDemoRecipe } from "@/lib/demo-localization";
import { getRecipeImageSrc } from "@/lib/recipe-image";
import type { Locale } from "@/i18n/config";
import { isCustomRecipe } from "@/lib/recipe-library";
import { cn } from "@/lib/utils";

export function RecipeCard({
  recipe,
  variant,
  servings = recipe.servings,
}: {
  recipe: Recipe;
  variant: "suggestion" | "library";
  servings?: number;
}) {
  const t = useTranslations("Recipe");
  const displayRecipe = localizeDemoRecipe(recipe, useLocale() as Locale);
  const suggestion = variant === "suggestion";
  const customRecipe = isCustomRecipe(recipe) ? recipe : null;
  const imageSrc = getRecipeImageSrc(recipe);
  let href = `/dashboard/co-ugotowac/${recipe.slug}`;
  if (customRecipe || recipe.slug.startsWith("ai-")) href = `/dashboard/moje-przepisy/${recipe.slug}`;

  return (
    <article className="app-card flex flex-col p-5">
      <div className={cn("relative mb-4 flex h-40 items-center justify-center overflow-hidden rounded-lg", !imageSrc && "bg-secondary text-primary")}>
        {imageSrc ? (
          <RecipeImage key={imageSrc} src={imageSrc} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized={Boolean(recipe.imagePath)} />
        ) : (
          <ChefHatIcon className="size-9" aria-hidden="true" />
        )}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold">{displayRecipe.title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{displayRecipe.description}</p>
        </div>
        <FavoriteRecipeButton slug={recipe.slug} compact />
      </div>

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <ClockIcon className="size-4" aria-hidden="true" /> {t("totalTime")}: {t("minutes", { count: recipe.time })}
          </span>
          <span className="flex items-center gap-1">
            <UsersIcon className="size-4" aria-hidden="true" /> {t("servings", { count: servings })}
          </span>
          <span className="flex items-center gap-1">
            <ChefHatIcon className="size-4" aria-hidden="true" /> {difficultyMessageKeys[recipe.difficulty] ? t(`difficultyOptions.${difficultyMessageKeys[recipe.difficulty]}`) : recipe.difficulty}
          </span>
        </div>

        {recipe.calories && recipe.calories > 0 ? (
          <p className="mt-3 text-xs font-semibold text-muted-foreground">
            {t("nutrition.card", { calories: recipe.calories })}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2">
          <Button
            nativeButton={false}
            render={<Link href={href} />}
            className="h-11 min-w-0 flex-1"
          >
            {t("viewRecipe")} <ArrowRightIcon aria-hidden="true" />
          </Button>
          {!suggestion && customRecipe ? (
            <div className="flex gap-2 self-end">
              <EditRecipeDialog recipe={customRecipe} />
              <DeleteRecipeDialog recipe={customRecipe} />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
