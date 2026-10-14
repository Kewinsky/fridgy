import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ChefHatIcon,
  ClockIcon,
  Globe2Icon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";

import { AddMissingItemsButton } from "@/components/dashboard/add-missing-items-button";
import {
  DeleteRecipeDialog,
  EditRecipeDialog,
} from "@/components/dashboard/add-recipe-dialog";
import { FavoriteRecipeButton, StartCookingButton } from "@/components/dashboard/recipe-actions";
import { RecipeCookingStats } from "@/components/dashboard/recipe-cooking-stats";
import {
  cuisineMessageKeys,
  difficultyMessageKeys,
  isCuisine,
} from "@/components/dashboard/recipe-options";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMissingIngredients, type Recipe } from "@/lib/demo-recipes";
import { localizeDemoRecipe } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";
import { isCustomRecipe } from "@/lib/recipe-library";

export function RecipeDetail({
  recipe,
  eyebrow,
  backHref,
  showFavoriteAction = true,
  showCookingStats = false,
}: {
  recipe: Recipe;
  eyebrow?: string;
  backHref: string;
  showFavoriteAction?: boolean;
  showCookingStats?: boolean;
}) {
  const t = useTranslations("Recipe");
  const displayRecipe = localizeDemoRecipe(recipe, useLocale() as Locale);
  const missing = getMissingIngredients(recipe);
  const customRecipe = isCustomRecipe(recipe) ? recipe : null;

  return (
    <>
      <PageHeader
        eyebrow={eyebrow ?? t("recipe")}
        title={displayRecipe.title}
        description={displayRecipe.description}
        actions={
          <Button
            nativeButton={false}
            render={<Link href={backHref} />}
            variant="outline"
            className="h-11"
          >
            <ArrowLeftIcon aria-hidden="true" /> {t("back")}
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-5">
          <section className="app-card overflow-hidden">
            <div className="flex min-h-48 items-center justify-center bg-secondary text-primary sm:min-h-64">
              <ChefHatIcon className="size-16" aria-hidden="true" />
            </div>
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
              <RecipeFact icon={<ClockIcon />} label={t("time")} value={t("minutes", { count: recipe.time })} />
              <RecipeFact icon={<UsersIcon />} label={t("servingsLabel")} value={`${recipe.servings}`} />
              <RecipeFact icon={<Globe2Icon />} label={t("cuisine")} value={isCuisine(recipe.cuisine) ? t(`cuisineOptions.${cuisineMessageKeys[recipe.cuisine]}`) : recipe.cuisine} />
              <RecipeFact icon={<ChefHatIcon />} label={t("difficulty")} value={difficultyMessageKeys[recipe.difficulty] ? t(`difficultyOptions.${difficultyMessageKeys[recipe.difficulty]}`) : recipe.difficulty} />
            </div>
          </section>

          {showCookingStats ? <RecipeCookingStats slug={recipe.slug} /> : null}

          <section className="app-card p-5 sm:p-6">
            <h2 className="text-xl font-extrabold">{t("preparation")}</h2>
            <ol className="mt-5 space-y-5">
              {displayRecipe.steps.map((step, index) => (
                <li key={`${index}-${step}`} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="app-card h-fit p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold">{t("ingredients")}</h2>
            <Badge variant="secondary">{t("servings", { count: recipe.servings })}</Badge>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {displayRecipe.ingredients.map((ingredient, index) => (
              <li key={`${index}-${ingredient.name}`} className="flex min-h-14 items-center gap-3 py-2">
                {ingredient.available ? (
                  <CheckCircle2Icon className="size-5 shrink-0 text-fresh" aria-hidden="true" />
                ) : (
                  <XCircleIcon className="size-5 shrink-0 text-destructive" aria-hidden="true" />
                )}
                <span className="min-w-0 flex-1 text-sm font-semibold">{ingredient.name}</span>
                <span className="text-sm text-muted-foreground">{ingredient.amount}</span>
              </li>
            ))}
          </ul>

          {missing.length ? (
            <>
              <div className="mt-5 rounded-lg bg-muted p-4">
                <p className="text-sm font-bold">
                  {t("missingCount", { count: missing.length })}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t("missingDescription")}
                </p>
              </div>
              <AddMissingItemsButton
                names={missing.map((ingredient) => ingredient.name)}
                className="mt-4 w-full"
              />
            </>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <StartCookingButton recipe={recipe} className="w-full" />
            {showFavoriteAction ? (
              <FavoriteRecipeButton slug={recipe.slug} compact />
            ) : null}
            {customRecipe ? (
              <>
                <EditRecipeDialog recipe={customRecipe} />
                <DeleteRecipeDialog recipe={customRecipe} />
              </>
            ) : null}
          </div>
        </aside>
      </div>
    </>
  );
}

function RecipeFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <div className="mb-2 text-primary [&_svg]:size-5" aria-hidden="true">{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}
