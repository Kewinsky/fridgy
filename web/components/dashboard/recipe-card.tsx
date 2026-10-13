import Link from "next/link";
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
import { AddMissingItemsButton } from "@/components/dashboard/add-missing-items-button";
import { FavoriteRecipeButton } from "@/components/dashboard/recipe-actions";
import { Button } from "@/components/ui/button";
import {
  getMissingIngredients,
  getRecipeMatch,
  type Recipe,
} from "@/lib/demo-recipes";
import { isCustomRecipe } from "@/lib/recipe-library";

export function RecipeCard({
  recipe,
  variant,
  servings = recipe.servings,
}: {
  recipe: Recipe;
  variant: "suggestion" | "library";
  servings?: number;
}) {
  const suggestion = variant === "suggestion";
  const customRecipe = isCustomRecipe(recipe) ? recipe : null;
  const missing = suggestion ? getMissingIngredients(recipe) : [];
  const match = suggestion ? getRecipeMatch(recipe) : null;
  const href = customRecipe
    ? `/dashboard/moje-przepisy/${recipe.slug}`
    : `/dashboard/co-ugotowac/${recipe.slug}`;

  return (
    <article className="app-card flex flex-col p-5">
      <div className="mb-4 flex h-24 items-center justify-center rounded-lg bg-secondary text-primary">
        <ChefHatIcon className="size-9" aria-hidden="true" />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold">{recipe.title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{recipe.description}</p>
        </div>
        <FavoriteRecipeButton slug={recipe.slug} compact />
      </div>

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <ClockIcon className="size-4" aria-hidden="true" /> {recipe.time} min
          </span>
          <span className="flex items-center gap-1">
            <UsersIcon className="size-4" aria-hidden="true" /> {servings} porcje
          </span>
          <span className="flex items-center gap-1">
            <ChefHatIcon className="size-4" aria-hidden="true" /> {recipe.difficulty}
          </span>
        </div>

        {match ? (
          <>
            <p className="mt-4 text-sm font-bold">{match.available} z {match.total} składników masz w domu</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`Masz ${match.available} z ${match.total} składników`} aria-valuenow={match.available} aria-valuemin={0} aria-valuemax={match.total}>
              <div className="h-full bg-primary" style={{ width: `${(match.available / match.total) * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {missing.length
                ? `Brakuje: ${missing.map((ingredient) => ingredient.name).join(", ")}`
                : "Masz wszystkie składniki"}
            </p>
          </>
        ) : null}

        <div className="mt-5 flex gap-2">
          <div className="grid min-w-0 flex-1 gap-2">
            {suggestion && missing.length ? (
              <AddMissingItemsButton
                names={missing.map((ingredient) => ingredient.name)}
                className="w-full"
              />
            ) : null}
            <Button
              nativeButton={false}
              render={<Link href={href} />}
              className="h-11 w-full"
            >
              Zobacz przepis <ArrowRightIcon aria-hidden="true" />
            </Button>
          </div>
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
