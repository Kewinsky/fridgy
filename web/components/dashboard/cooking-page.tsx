"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ChefHatIcon, ClockIcon, RefreshCwIcon, UsersIcon } from "lucide-react";

import { AddMissingItemsButton } from "@/components/dashboard/add-missing-items-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { demoRecipes, getMissingIngredients, getRecipeMatch } from "@/lib/demo-recipes";
import { cn } from "@/lib/utils";

const meals = ["Śniadanie", "Obiad", "Kolacja", "Przekąska", "Bez znaczenia"] as const;
const times = ["Do 15 minut", "Do 30 minut", "Do 60 minut", "Bez ograniczeń"] as const;
const cravings = ["Coś lekkiego i zdrowego", "Coś wysokobiałkowego", "Comfort food", "Kuchnia świata", "Coś prostego i szybkiego", "Zaskocz mnie"] as const;
const diets = ["Bez ograniczeń", "Wegetariańska", "Wegańska", "Bez glutenu", "Bez laktozy"] as const;
const shoppingOptions = ["Nie, tylko to, co mam", "Tak, maksymalnie 2 produkty", "Tak, bez ograniczeń"] as const;
export function CookingPage() {
  const [meal, setMeal] = useState<(typeof meals)[number]>("Bez znaczenia");
  const [time, setTime] = useState<(typeof times)[number]>("Do 30 minut");
  const [servings, setServings] = useState(2);
  const [craving, setCraving] = useState<(typeof cravings)[number]>("Zaskocz mnie");
  const [diet, setDiet] = useState<(typeof diets)[number]>("Bez ograniczeń");
  const [shopping, setShopping] = useState<(typeof shoppingOptions)[number]>("Tak, maksymalnie 2 produkty");
  const [showRecipes, setShowRecipes] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Z tego, co masz"
        title="Co ugotować?"
        description="Odpowiedz na kilka pytań, a Fridgy dopasuje propozycje do Twoich zapasów."
      />

      {showRecipes ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{meal} · {time} · {servings} os. · {craving} · {diet}</p>
            <Button variant="outline" className="h-11" onClick={() => setShowRecipes(false)}>
              <RefreshCwIcon aria-hidden="true" /> Zmień odpowiedzi
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {demoRecipes.map((recipe) => {
              const match = getRecipeMatch(recipe);
              const missing = getMissingIngredients(recipe);

              return (
              <article key={recipe.slug} className="app-card flex flex-col p-5">
                <div className="mb-4 flex h-24 items-center justify-center rounded-lg bg-secondary text-primary">
                  <ChefHatIcon className="size-9" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-extrabold">{recipe.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{recipe.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1"><ClockIcon className="size-4" aria-hidden="true" /> {recipe.time} min</span>
                  <span className="flex items-center gap-1"><UsersIcon className="size-4" aria-hidden="true" /> {servings} porcje</span>
                </div>
                <p className="mt-4 text-sm font-bold">{match.available} z {match.total} składników masz w domu</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`Masz ${match.available} z ${match.total} składników`} aria-valuenow={match.available} aria-valuemin={0} aria-valuemax={match.total}>
                  <div className="h-full bg-primary" style={{ width: `${(match.available / match.total) * 100}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Brakuje: {missing.map((ingredient) => ingredient.name).join(", ")}</p>
                <div className="mt-5 grid gap-2">
                  <AddMissingItemsButton
                    names={missing.map((ingredient) => ingredient.name)}
                    className="w-full"
                  />
                  <Button
                    nativeButton={false}
                    render={<Link href={`/dashboard/co-ugotowac/${recipe.slug}`} />}
                    className="h-11 w-full"
                  >
                    Zobacz przepis <ArrowRightIcon aria-hidden="true" />
                  </Button>
                </div>
              </article>
              );
            })}
          </div>
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
      <p className="text-xs font-bold uppercase tracking-wider text-primary">Pytanie {number} z 6</p>
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
