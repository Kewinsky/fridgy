"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpenCheckIcon, CheckIcon, ChefHatIcon, RefreshCwIcon, SparklesIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { RecipeCard } from "@/components/dashboard/recipe-card";
import { useRecipeLibrary } from "@/components/dashboard/use-recipe-library";
import { Button } from "@/components/ui/button";
import { demoRecipes } from "@/lib/demo-recipes";
import { cn } from "@/lib/utils";

const meals = ["breakfast", "lunch", "dinner", "snack", "any"] as const;
const times = ["15", "30", "60", "any"] as const;
const cravings = ["light", "protein", "comfort", "world", "simple", "surprise"] as const;
const diets = ["any", "vegetarian", "vegan", "glutenFree", "lactoseFree"] as const;
const shoppingOptions = ["none", "two", "any"] as const;
const savedRecipeOptions = ["include", "newOnly", "any"] as const;
export function CookingPage() {
  const t = useTranslations("Cooking");
  const library = useRecipeLibrary();
  const [meal, setMeal] = useState<(typeof meals)[number]>("any");
  const [time, setTime] = useState<(typeof times)[number]>("30");
  const [servings, setServings] = useState(2);
  const [craving, setCraving] = useState<(typeof cravings)[number]>("surprise");
  const [diet, setDiet] = useState<(typeof diets)[number]>("any");
  const [shopping, setShopping] = useState<(typeof shoppingOptions)[number]>("two");
  const [savedRecipes, setSavedRecipes] = useState<(typeof savedRecipeOptions)[number]>("include");
  const [showRecipes, setShowRecipes] = useState(false);
  const [visibleRecipeCount, setVisibleRecipeCount] = useState(3);
  const usedRecipeSlugs = new Set([
    ...library.favoriteSlugs,
    ...library.history.map((record) => record.recipeSlug),
  ]);
  const rememberedDemoRecipes = [...demoRecipes].sort(
    (first, second) => Number(usedRecipeSlugs.has(second.slug)) - Number(usedRecipeSlugs.has(first.slug)),
  );
  const candidateRecipes = savedRecipes === "include"
    ? [...library.customRecipes, ...rememberedDemoRecipes]
    : savedRecipes === "newOnly"
      ? demoRecipes.filter((recipe) => !usedRecipeSlugs.has(recipe.slug))
      : demoRecipes;
  const visibleRecipes = candidateRecipes.slice(0, visibleRecipeCount);

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
              {t(`options.meals.${meal}`)} · {t(`options.times.${time}`)} · {t("servings", { count: servings })} · {t(`options.cravings.${craving}`)} · {t(`options.diets.${diet}`)} · {t(`options.saved.${savedRecipes}`)}
            </p>
            <Button
              variant="outline"
              className="h-11"
              onClick={() => {
                setShowRecipes(false);
                setVisibleRecipeCount(3);
              }}
            >
              <RefreshCwIcon aria-hidden="true" /> {t("changeAnswers")}
            </Button>
          </div>
          {visibleRecipes.length ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {visibleRecipes.map((recipe) => {
                return (
                  <RecipeCard
                    key={recipe.slug}
                    recipe={recipe}
                    variant="suggestion"
                    servings={servings}
                  />
                );
              })}
            </div>
          ) : (
            <section className="app-card p-8 text-center">
              <h2 className="text-lg font-extrabold">{t("empty.title")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
            </section>
          )}
          {candidateRecipes.length > 3 && visibleRecipeCount === 3 ? (
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
                onClick={() => setVisibleRecipeCount((count) => count + 3)}
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
          <div className="grid gap-4 lg:grid-cols-2">
            <Question number="1" title={t("questions.meal")}>
              <Chips options={meals} value={meal} onChange={setMeal} getLabel={(value) => t(`options.meals.${value}`)} />
            </Question>
            <Question number="2" title={t("questions.time")}>
              <Chips options={times} value={time} onChange={setTime} getLabel={(value) => t(`options.times.${value}`)} />
            </Question>
            <Question number="3" title={t("questions.servings")}>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon-lg" aria-label={t("fewerPeople")} disabled={servings <= 1} onClick={() => setServings((value) => value - 1)}>−</Button>
                <span className="w-24 text-center text-lg font-extrabold" aria-live="polite">{t("servings", { count: servings })}</span>
                <Button variant="outline" size="icon-lg" aria-label={t("morePeople")} disabled={servings >= 12} onClick={() => setServings((value) => value + 1)}>+</Button>
              </div>
            </Question>
            <Question number="4" title={t("questions.craving")}>
              <Chips options={cravings} value={craving} onChange={setCraving} getLabel={(value) => t(`options.cravings.${value}`)} />
            </Question>
            <Question number="5" title={t("questions.diet")}>
              <Chips options={diets} value={diet} onChange={setDiet} getLabel={(value) => t(`options.diets.${value}`)} />
            </Question>
            <Question number="6" title={t("questions.shopping")}>
              <Chips options={shoppingOptions} value={shopping} onChange={setShopping} getLabel={(value) => t(`options.shopping.${value}`)} />
            </Question>
            <Question number="7" title={t("questions.saved")}>
              <Chips options={savedRecipeOptions} value={savedRecipes} onChange={setSavedRecipes} getLabel={(value) => t(`options.saved.${value}`)} />
            </Question>
          </div>
          <div className="sticky bottom-20 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 p-4 backdrop-blur lg:bottom-4">
            <p className="text-sm text-muted-foreground">{t("demoNotice")}</p>
            <Button className="h-11" onClick={() => setShowRecipes(true)}><ChefHatIcon aria-hidden="true" /> {t("showSuggestions")}</Button>
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
      <h2 className="mb-3 mt-1 text-lg font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

function Chips<T extends string>({ options, value, onChange, getLabel }: { options: readonly T[]; value: T; onChange: (value: T) => void; getLabel: (value: T) => string }) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
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
