"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BookOpenCheckIcon, CheckIcon, ChefHatIcon, RefreshCwIcon, SparklesIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { RecipeCard } from "@/components/dashboard/recipe-card";
import { RecipeCardSkeleton } from "@/components/dashboard/recipe-card-skeleton";
import { useRecipeLibrary } from "@/components/dashboard/use-recipe-library";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { demoRecipes, filterRecipesByCuisines, recipeAllergens, type Recipe } from "@/lib/demo-recipes";
import { localizeDemoRecipe } from "@/lib/demo-localization";
import { getRecipePreferenceConflicts } from "@/lib/recipe-preferences";
import type { Locale } from "@/i18n/config";
import { cuisineMessageKeys, cuisines as recipeCuisines, type Cuisine } from "@/components/dashboard/recipe-options";
import { cn } from "@/lib/utils";

const meals = ["breakfast", "lunch", "dinner", "snack", "dessert"] as const;
const times = ["15", "30", "60", "any"] as const;
const shoppingOptions = ["none", "two", "any"] as const;
const savedRecipeOptions = ["include", "newOnly"] as const;
const maxNotesLength = 500;
export function CookingPage() {
  const t = useTranslations("Cooking");
  const recipeT = useTranslations("Recipe.cuisineOptions");
  const allergenT = useTranslations("Recipe.allergens.options");
  const locale = useLocale() as Locale;
  const library = useRecipeLibrary();
  const preferences = useDashboardData();
  const [meal, setMeal] = useState<(typeof meals)[number] | null>(null);
  const [time, setTime] = useState<(typeof times)[number]>("30");
  const [servings, setServings] = useState(2);
  const [selectedCuisines, setSelectedCuisines] = useState<Cuisine[]>([]);
  const [shopping, setShopping] = useState<(typeof shoppingOptions)[number]>("two");
  const [savedRecipes, setSavedRecipes] = useState<(typeof savedRecipeOptions)[number]>("include");
  const [notes, setNotes] = useState("");
  const [showRecipes, setShowRecipes] = useState(false);
  const [visibleRecipeCount, setVisibleRecipeCount] = useState(3);
  const [loadingPhase, setLoadingPhase] = useState<"initial" | "more" | null>(null);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (loadingTimer.current) clearTimeout(loadingTimer.current);
    };
  }, []);

  function showSuggestions() {
    if (!meal || loadingTimer.current) return;
    setShowRecipes(true);
    setLoadingPhase("initial");
    // Demo delay until recipe generation is connected.
    loadingTimer.current = setTimeout(() => {
      setLoadingPhase(null);
      loadingTimer.current = null;
    }, 900);
  }

  function showMoreSuggestions() {
    if (loadingTimer.current) return;
    setLoadingPhase("more");
    loadingTimer.current = setTimeout(() => {
      setVisibleRecipeCount((count) => count + 3);
      setLoadingPhase(null);
      loadingTimer.current = null;
    }, 900);
  }

  function changeAnswers() {
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    loadingTimer.current = null;
    setLoadingPhase(null);
    setShowRecipes(false);
    setVisibleRecipeCount(3);
  }
  const usedRecipeSlugs = new Set([
    ...library.favoriteSlugs,
    ...library.history.map((record) => record.recipeSlug),
  ]);
  const rememberedDemoRecipes = [...demoRecipes].sort(
    (first, second) => Number(usedRecipeSlugs.has(second.slug)) - Number(usedRecipeSlugs.has(first.slug)),
  );
  const savedCandidates = savedRecipes === "include"
    ? [...library.customRecipes, ...rememberedDemoRecipes]
    : savedRecipes === "newOnly"
      ? demoRecipes.filter((recipe) => !usedRecipeSlugs.has(recipe.slug))
      : demoRecipes;
  const allergenLabels = Object.fromEntries(recipeAllergens.map((allergen) => [allergen, allergenT(allergen)]));
  function conflictCount(recipe: Recipe) {
    const conflicts = getRecipePreferenceConflicts(localizeDemoRecipe(recipe, locale), preferences, allergenLabels);
    return conflicts.matchingAllergens.length + conflicts.matchingIngredients.length + Number(conflicts.dietConflict);
  }
  const candidateRecipes = [...filterRecipesByCuisines(savedCandidates, selectedCuisines)]
    .sort((first, second) => conflictCount(first) - conflictCount(second));
  const visibleRecipes = candidateRecipes.slice(0, visibleRecipeCount);
  const skeletonCount = loadingPhase === "more"
    ? Math.min(3, candidateRecipes.length - visibleRecipeCount)
    : 3;

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={
          <Button nativeButton={false} render={<Link href="/dashboard/moje-przepisy" />} variant="outline" className="h-11">
            <BookOpenCheckIcon aria-hidden="true" /> {t("myRecipes")}
          </Button>
        }
      />

      {showRecipes ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {meal ? t(`options.meals.${meal}`) : null} · {t(`options.times.${time}`)} · {t("servings", { count: servings })} · {t(`options.shopping.${shopping}`)} · {selectedCuisines.length ? selectedCuisines.map((cuisine) => recipeT(cuisineMessageKeys[cuisine])).join(", ") : t("options.cuisines.any")} · {t(`options.saved.${savedRecipes}`)}
            </p>
            <Button
              variant="outline"
              className="h-11"
              onClick={changeAnswers}
            >
              <RefreshCwIcon aria-hidden="true" /> {t("changeAnswers")}
            </Button>
          </div>
          {loadingPhase ? <p className="sr-only" role="status">{t("loadingSuggestions")}</p> : null}
          {visibleRecipes.length || loadingPhase ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {loadingPhase !== "initial" ? visibleRecipes.map((recipe) => {
                return (
                  <RecipeCard
                    key={recipe.slug}
                    recipe={recipe}
                    variant="suggestion"
                    servings={servings}
                  />
                );
              }) : null}
              {loadingPhase ? Array.from({ length: skeletonCount }, (_, index) => <RecipeCardSkeleton key={`skeleton-${index}`} />) : null}
            </div>
          ) : (
            <section className="app-card p-8 text-center">
              <h2 className="text-lg font-extrabold">{t("empty.title")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
            </section>
          )}
          {candidateRecipes.length > 3 && visibleRecipeCount === 3 && !loadingPhase ? (
            <section className="app-card mt-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-extrabold">{t("more.title")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("more.description")}
                </p>
              </div>
              <Button
                variant="outline"
                className="h-11 shrink-0"
                onClick={showMoreSuggestions}
              >
                <SparklesIcon aria-hidden="true" /> {t("more.button")}
              </Button>
            </section>
          ) : visibleRecipeCount > 3 ? (
            <p className="mt-4 text-center text-sm text-muted-foreground" aria-live="polite">
              {t("more.count", { count: visibleRecipes.length })}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <div className="grid items-start gap-5 lg:grid-cols-2">
            <Question number="1" title={t("questions.meal")}>
              <Chips options={meals} value={meal} onChange={setMeal} getLabel={(value) => t(`options.meals.${value}`)} label={t("questions.meal")} required />
              <p className="mt-3 text-xs text-muted-foreground">{t("mealRequired")}</p>
            </Question>
            <Question number="2" title={t("questions.servings")}>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon-lg" aria-label={t("fewerPeople")} disabled={servings <= 1} onClick={() => setServings((value) => value - 1)}>−</Button>
                <span className="w-24 text-center text-lg font-extrabold" aria-live="polite">{t("servings", { count: servings })}</span>
                <Button variant="outline" size="icon-lg" aria-label={t("morePeople")} disabled={servings >= 12} onClick={() => setServings((value) => value + 1)}>+</Button>
              </div>
            </Question>
            <Question number="3" title={t("questions.time")}>
              <Chips options={times} value={time} onChange={setTime} getLabel={(value) => t(`options.times.${value}`)} label={t("questions.time")} />
            </Question>
            <Question number="4" title={t("questions.shopping")}>
              <Chips options={shoppingOptions} value={shopping} onChange={setShopping} getLabel={(value) => t(`options.shopping.${value}`)} label={t("questions.shopping")} />
            </Question>
          </div>
          <details className="app-card mt-5 p-5">
            <summary className="cursor-pointer font-extrabold">{t("optional.title")}</summary>
            <div className="mt-5 space-y-6">
              <div>
                <h2 className="mb-3 font-bold">{t("questions.cuisine")}</h2>
                <div className="flex flex-wrap gap-2">
                  {recipeCuisines.map((cuisine) => (
                    <Button
                      key={cuisine}
                      type="button"
                      aria-pressed={selectedCuisines.includes(cuisine)}
                      variant={selectedCuisines.includes(cuisine) ? "secondary" : "outline"}
                      onClick={() => setSelectedCuisines((current) => current.includes(cuisine) ? current.filter((item) => item !== cuisine) : [...current, cuisine])}
                      className={cn("min-h-11 px-3 py-2 text-left text-sm font-semibold whitespace-normal", selectedCuisines.includes(cuisine) ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground")}
                    >
                      {selectedCuisines.includes(cuisine) ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
                      {recipeT(cuisineMessageKeys[cuisine])}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="mb-3 font-bold">{t("questions.saved")}</h2>
                <Chips options={savedRecipeOptions} value={savedRecipes} onChange={setSavedRecipes} getLabel={(value) => t(`options.saved.${value}`)} label={t("questions.saved")} />
              </div>
              <div>
                <label htmlFor="cooking-notes" className="mb-3 block font-bold">{t("optional.notesLabel")}</label>
                <Textarea
                  id="cooking-notes"
                  maxLength={maxNotesLength}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t("optional.notesPlaceholder")}
                  aria-describedby="cooking-notes-hint cooking-notes-count"
                />
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                  <p id="cooking-notes-hint">{t("optional.notesHint")}</p>
                  <p id="cooking-notes-count">{t("optional.notesCount", { count: notes.length, max: maxNotesLength })}</p>
                </div>
              </div>
            </div>
          </details>
          <div className="sticky bottom-20 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 p-4 backdrop-blur lg:bottom-4">
            <p className="text-sm text-muted-foreground">{t("demoNotice")}</p>
            <Button className="h-11" onClick={showSuggestions} disabled={!meal}><ChefHatIcon aria-hidden="true" /> {t("showSuggestions")}</Button>
          </div>
        </>
      )}
    </>
  );
}

function Question({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  const t = useTranslations("Cooking");
  return (
    <section className="app-card p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">{t("questionProgress", { number })}</p>
      <h2 className="mt-1 text-lg font-extrabold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Chips<T extends string>({ options, value, onChange, getLabel, label, required = false }: { options: readonly T[]; value: T | null; onChange: (value: T) => void; getLabel: (value: T) => string; label: string; required?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} aria-required={required} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          variant={value === option ? "secondary" : "outline"}
          onClick={() => onChange(option)}
          className={cn(
            "min-h-11 px-3 py-2 text-left text-sm font-semibold whitespace-normal",
            value === option ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {value === option ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
          {getLabel(option)}
        </Button>
      ))}
    </div>
  );
}
