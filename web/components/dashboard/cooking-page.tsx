"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpenCheckIcon, CheckIcon, ChefHatIcon, RefreshCwIcon, SparklesIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { RecipeCard } from "@/components/dashboard/recipe-card";
import { useRecipeLibrary } from "@/components/dashboard/use-recipe-library";
import { Button } from "@/components/ui/button";
import { demoRecipes } from "@/lib/demo-recipes";
import { cn } from "@/lib/utils";

const meals = ["Śniadanie", "Obiad", "Kolacja", "Przekąska", "Bez znaczenia"] as const;
const times = ["Do 15 minut", "Do 30 minut", "Do 60 minut", "Bez ograniczeń"] as const;
const cravings = ["Coś lekkiego i zdrowego", "Coś wysokobiałkowego", "Comfort food", "Kuchnia świata", "Coś prostego i szybkiego", "Zaskocz mnie"] as const;
const diets = ["Bez ograniczeń", "Wegetariańska", "Wegańska", "Bez glutenu", "Bez laktozy"] as const;
const shoppingOptions = ["Nie, tylko to, co mam", "Tak, maksymalnie 2 produkty", "Tak, bez ograniczeń"] as const;
const savedRecipeOptions = ["Tak, uwzględnij je", "Tylko nowe propozycje", "Bez znaczenia"] as const;
export function CookingPage() {
  const library = useRecipeLibrary();
  const [meal, setMeal] = useState<(typeof meals)[number]>("Bez znaczenia");
  const [time, setTime] = useState<(typeof times)[number]>("Do 30 minut");
  const [servings, setServings] = useState(2);
  const [craving, setCraving] = useState<(typeof cravings)[number]>("Zaskocz mnie");
  const [diet, setDiet] = useState<(typeof diets)[number]>("Bez ograniczeń");
  const [shopping, setShopping] = useState<(typeof shoppingOptions)[number]>("Tak, maksymalnie 2 produkty");
  const [savedRecipes, setSavedRecipes] = useState<(typeof savedRecipeOptions)[number]>("Tak, uwzględnij je");
  const [showRecipes, setShowRecipes] = useState(false);
  const [visibleRecipeCount, setVisibleRecipeCount] = useState(3);
  const usedRecipeSlugs = new Set([
    ...library.favoriteSlugs,
    ...library.history.map((record) => record.recipeSlug),
  ]);
  const rememberedDemoRecipes = [...demoRecipes].sort(
    (first, second) => Number(usedRecipeSlugs.has(second.slug)) - Number(usedRecipeSlugs.has(first.slug)),
  );
  const candidateRecipes = savedRecipes === "Tak, uwzględnij je"
    ? [...library.customRecipes, ...rememberedDemoRecipes]
    : savedRecipes === "Tylko nowe propozycje"
      ? demoRecipes.filter((recipe) => !usedRecipeSlugs.has(recipe.slug))
      : demoRecipes;
  const visibleRecipes = candidateRecipes.slice(0, visibleRecipeCount);

  return (
    <>
      <PageHeader
        eyebrow="Z tego, co masz"
        title="Co ugotować?"
        description="Odpowiedz na kilka pytań, a Fridgy dopasuje propozycje do Twoich zapasów."
        actions={
          <Button nativeButton={false} render={<Link href="/dashboard/moje-przepisy" />} variant="outline" className="h-11">
            <BookOpenCheckIcon aria-hidden="true" /> Moje przepisy
          </Button>
        }
      />

      {showRecipes ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{meal} · {time} · {servings} os. · {craving} · {diet} · {savedRecipes}</p>
            <Button
              variant="outline"
              className="h-11"
              onClick={() => {
                setShowRecipes(false);
                setVisibleRecipeCount(3);
              }}
            >
              <RefreshCwIcon aria-hidden="true" /> Zmień odpowiedzi
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
              <h2 className="text-lg font-extrabold">Brak nowych propozycji</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Wszystkie przepisy z wersji demo są już zapisane lub ugotowane. Zmień odpowiedź dotyczącą zapisanych dań.
              </p>
            </section>
          )}
          {candidateRecipes.length > 3 && visibleRecipeCount === 3 ? (
            <section className="app-card mt-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-extrabold">Żaden przepis Ci nie pasuje?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Poproś AI o kolejne trzy propozycje. Obecne przepisy pozostaną na liście.
                </p>
              </div>
              <Button
                variant="outline"
                className="h-11 shrink-0"
                onClick={() => setVisibleRecipeCount((count) => count + 3)}
              >
                <SparklesIcon aria-hidden="true" /> Zaproponuj coś innego
              </Button>
            </section>
          ) : visibleRecipeCount > 3 ? (
            <p className="mt-4 text-center text-sm text-muted-foreground" aria-live="polite">
              Masz teraz {visibleRecipes.length} propozycji do wyboru.
            </p>
          ) : null}
        </>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Question number="1" title="Jaki posiłek?">
              <Chips options={meals} value={meal} onChange={setMeal} />
            </Question>
            <Question number="2" title="Ile masz czasu?">
              <Chips options={times} value={time} onChange={setTime} />
            </Question>
            <Question number="3" title="Na ile osób gotujesz?">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon-lg" aria-label="Mniej osób" disabled={servings <= 1} onClick={() => setServings((value) => value - 1)}>−</Button>
                <span className="w-24 text-center text-lg font-extrabold" aria-live="polite">{servings} osoby</span>
                <Button variant="outline" size="icon-lg" aria-label="Więcej osób" disabled={servings >= 12} onClick={() => setServings((value) => value + 1)}>+</Button>
              </div>
            </Question>
            <Question number="4" title="Na co masz ochotę?">
              <Chips options={cravings} value={craving} onChange={setCraving} />
            </Question>
            <Question number="5" title="Jak jesz?">
              <Chips options={diets} value={diet} onChange={setDiet} />
            </Question>
            <Question number="6" title="Czy możesz dokupić składniki?">
              <Chips options={shoppingOptions} value={shopping} onChange={setShopping} />
            </Question>
            <Question number="7" title="Czy brać pod uwagę Twoje zapisane dania?">
              <Chips options={savedRecipeOptions} value={savedRecipes} onChange={setSavedRecipes} />
            </Question>
          </div>
          <div className="sticky bottom-20 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 p-4 backdrop-blur lg:bottom-4">
            <p className="text-sm text-muted-foreground">Na razie używamy demonstracyjnych zapasów.</p>
            <Button className="h-11" onClick={() => setShowRecipes(true)}><ChefHatIcon aria-hidden="true" /> Pokaż 3 propozycje</Button>
          </div>
        </>
      )}
    </>
  );
}

function Question({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="app-card p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">Pytanie {number} z 7</p>
      <h2 className="mb-3 mt-1 text-lg font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

function Chips<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (value: T) => void }) {
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
          {option}
        </Button>
      ))}
    </div>
  );
}
