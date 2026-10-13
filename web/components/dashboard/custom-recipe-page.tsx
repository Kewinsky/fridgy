"use client";

import Link from "next/link";
import { BookOpenIcon } from "lucide-react";

import { RecipeDetail } from "@/components/dashboard/recipe-detail";
import { useRecipeLibrary } from "@/components/dashboard/use-recipe-library";
import { Button } from "@/components/ui/button";

export function CustomRecipePage({ slug }: { slug: string }) {
  const library = useRecipeLibrary();
  const recipe = library.customRecipes.find((item) => item.slug === slug);

  if (!recipe) {
    return (
      <section className="app-card px-5 py-12 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <BookOpenIcon aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold">Nie znaleziono przepisu</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ten przepis nie istnieje już w Twojej bibliotece.</p>
        <Button nativeButton={false} render={<Link href="/dashboard/moje-przepisy" />} className="mt-5 h-11">
          Wróć do przepisów
        </Button>
      </section>
    );
  }

  return <RecipeDetail recipe={recipe} eyebrow="Twój przepis" backHref="/dashboard/moje-przepisy" />;
}
