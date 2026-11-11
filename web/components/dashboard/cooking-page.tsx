"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BookOpenCheckIcon, CheckIcon, ChefHatIcon, ChevronDownIcon, RefreshCwIcon, SparklesIcon } from "lucide-react";

import { generateRecipes } from "@/app/dashboard/data-actions";
import { BrandIcon } from "@/components/brand-icon";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecipeCard } from "@/components/dashboard/recipe-card";
import { RecipeCardSkeleton } from "@/components/dashboard/recipe-card-skeleton";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { StoredRecipe } from "@/lib/recipe-library";
import type { Locale } from "@/i18n/config";
import { cuisineMessageKeys, cuisines as recipeCuisines, type Cuisine } from "@/components/dashboard/recipe-options";
import { cn } from "@/lib/utils";
import { getFreshnessStatus, isPrioritizableProduct } from "@/lib/demo-data";

const meals = ["breakfast", "lunch", "dinner", "snack", "dessert", "soup"] as const;
const times = ["15", "30", "60", "any"] as const;
const shoppingOptions = ["none", "two", "any"] as const;
const savedRecipeOptions = ["include", "newOnly"] as const;
const maxNotesLength = 500;
export function CookingPage() {
  const t = useTranslations("Cooking");
  const recipeT = useTranslations("Recipe.cuisineOptions");
  const freshnessT = useTranslations("Inventory.freshness");
  const locale = useLocale() as Locale;
  const { addRecipes, householdId, products } = useDashboardData();
  const [meal, setMeal] = useState<(typeof meals)[number]>("lunch");
  const [time, setTime] = useState<(typeof times)[number]>("30");
  const [servings, setServings] = useState(2);
  const [selectedCuisines, setSelectedCuisines] = useState<Cuisine[]>([]);
  const [shopping, setShopping] = useState<(typeof shoppingOptions)[number]>("two");
  const [savedRecipes, setSavedRecipes] = useState<(typeof savedRecipeOptions)[number]>("include");
  const [priorityProductIds, setPriorityProductIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [showRecipes, setShowRecipes] = useState(false);
  const [recipes, setRecipes] = useState<StoredRecipe[]>([]);
  const [error, setError] = useState<"unavailable" | "emptyInventory" | "noMatches" | "notEnoughSuggestions" | "priorityUnavailable" | "failed" | null>(null);
  const [partial, setPartial] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<"initial" | "more" | null>(null);
  const pending = useRef(false);
  const selectableProducts = products
    .filter((product) => isPrioritizableProduct(product))
    .sort((a, b) => a.estimatedUseBy.localeCompare(b.estimatedUseBy) || a.name.localeCompare(b.name, locale));

  async function requestSuggestions(more: boolean) {
    if (pending.current) return;
    pending.current = true;
    setShowRecipes(true);
    setLoadingPhase(more ? "more" : "initial");
    setError(null);
    setPartial(false);
    setAiMessage(null);
    try {
      const result = await generateRecipes({
        meal, servings, time, shopping, cuisines: selectedCuisines, savedRecipes, priorityProductIds, notes, locale,
        excludeTitles: more ? recipes.slice(-100).map((recipe) => recipe.title) : [],
      }, householdId);
      if (result.error) {
        setError(result.error);
      } else if (result.recipes) {
        setRecipes((current) => more ? [...current, ...result.recipes] : result.recipes);
        addRecipes(result.recipes);
        setPartial(result.partial);
        setAiMessage(result.message);
      }
    } catch {
      setError("failed");
    } finally {
      pending.current = false;
      setLoadingPhase(null);
    }
  }

  function changeAnswers() {
    if (pending.current) return;
    setLoadingPhase(null);
    setShowRecipes(false);
    setRecipes([]);
    setError(null);
    setPartial(false);
    setAiMessage(null);
  }

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
              {t(`options.meals.${meal}`)} · {t(`options.times.${time}`)} · {t("servings", { count: servings })} · {t(`options.shopping.${shopping}`)} · {selectedCuisines.length ? selectedCuisines.map((cuisine) => recipeT(cuisineMessageKeys[cuisine])).join(", ") : t("options.cuisines.any")} · {t(`options.saved.${savedRecipes}`)}
            </p>
            <Button
              variant="outline"
              className="h-11"
              disabled={loadingPhase !== null}
              onClick={changeAnswers}
            >
              <RefreshCwIcon aria-hidden="true" /> {t("changeAnswers")}
            </Button>
          </div>
          {loadingPhase ? <p className="sr-only" role="status">{t("loadingSuggestions")}</p> : null}
          {aiMessage ? (
            <section className="app-card mb-4 flex items-start gap-3 p-5" aria-label={t("aiMessageLabel")}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><SparklesIcon className="size-5" aria-hidden="true" /></span>
              <p className="pt-1 text-sm leading-6">{aiMessage}</p>
            </section>
          ) : null}
          {error ? <div role="alert" className="mb-4 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm font-semibold text-destructive"><BrandIcon name="warning" className="size-14" /><p>{t(`errors.${error}`)}</p></div> : null}
          {partial ? <p role="status" className="mb-4 rounded-lg border border-border bg-muted p-4 text-sm">{t("partialNoShopping")}</p> : null}
          {recipes.length || loadingPhase ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {loadingPhase !== "initial" ? recipes.map((recipe) => {
                return (
                  <RecipeCard
                    key={recipe.slug}
                    recipe={recipe}
                    variant="suggestion"
                  />
                );
              }) : null}
              {loadingPhase ? Array.from({ length: 3 }, (_, index) => <RecipeCardSkeleton key={`skeleton-${index}`} />) : null}
            </div>
          ) : !error ? (
            <section className="app-card p-8 text-center">
              <BrandIcon name="cooking_recipe" className="mx-auto mb-4 size-20" />
              <h2 className="text-lg font-extrabold">{t("empty.title")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
            </section>
          ) : null}
          {recipes.length > 0 && !loadingPhase ? (
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
                onClick={() => void requestSuggestions(true)}
              >
                <SparklesIcon aria-hidden="true" /> {t("more.button")}
              </Button>
            </section>
          ) : null}
        </>
      ) : (
        <>
          <div className="grid auto-rows-fr gap-5 lg:grid-cols-2">
            <Question number="1" title={t("questions.meal")}>
              <Chips options={meals} value={meal} onChange={setMeal} getLabel={(value) => t(`options.meals.${value}`)} label={t("questions.meal")} required />
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
          <details className="group app-card mt-5 overflow-hidden">
            <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-secondary/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring group-open:border-b group-open:border-border group-open:bg-secondary/30 [&::-webkit-details-marker]:hidden">
              <span className="font-extrabold">{t("optional.title")}</span>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                <ChevronDownIcon className="size-5 transition-transform duration-200 motion-reduce:transition-none group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            <div className="space-y-6 p-5">
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
                <h2 className="font-bold">{t("optional.priorityTitle")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("optional.priorityHint")}</p>
                {selectableProducts.length ? (
                  <>
                    <p className="mt-3 text-xs text-muted-foreground">{t("optional.priorityCount", { count: priorityProductIds.length })}</p>
                    <div role="group" aria-label={t("optional.priorityTitle")} className="mt-2 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                      {selectableProducts.map((product) => {
                        const selected = priorityProductIds.includes(product.id);
                        const freshness = getFreshnessStatus(product.estimatedUseBy);
                        return (
                          <Button
                            key={product.id}
                            type="button"
                            variant={selected ? "secondary" : "outline"}
                            aria-pressed={selected}
                            disabled={!selected && priorityProductIds.length >= 10}
                            onClick={() => setPriorityProductIds((current) => current.includes(product.id)
                              ? current.filter((id) => id !== product.id) : [...current, product.id])}
                            className={cn("h-auto min-h-14 justify-start gap-2 px-3 py-2 text-left whitespace-normal", selected && "border-primary text-primary")}
                          >
                            <span className="flex size-5 shrink-0 items-center justify-center rounded border border-current/40">
                              {selected ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block break-words font-semibold">{product.name}</span>
                              <span className="block text-xs text-muted-foreground">{product.quantity} {product.unit}</span>
                            </span>
                            {freshness !== "calm" ? <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{freshnessT(freshness)}</span> : null}
                          </Button>
                        );
                      })}
                    </div>
                  </>
                ) : <p className="mt-3 text-sm text-muted-foreground">{t("optional.priorityEmpty")}</p>}
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
            <p className="text-sm text-muted-foreground">{t("generationNotice")}</p>
            <Button className="h-11" onClick={() => void requestSuggestions(false)}><ChefHatIcon aria-hidden="true" /> {t("showSuggestions")}</Button>
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
