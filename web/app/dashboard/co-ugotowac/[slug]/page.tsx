import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ChefHatIcon,
  ClockIcon,
  FlameIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";

import { AddMissingItemsButton } from "@/components/dashboard/add-missing-items-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoRecipes, getMissingIngredients } from "@/lib/demo-recipes";

type RecipeRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return demoRecipes.map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({ params }: RecipeRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = demoRecipes.find((item) => item.slug === slug);
  return {
    title: recipe?.title ?? "Przepis",
    description: recipe?.description,
  };
}

export default async function RecipeRoute({ params }: RecipeRouteProps) {
  const { slug } = await params;
  const recipe = demoRecipes.find((item) => item.slug === slug);
  if (!recipe) notFound();

  const missing = getMissingIngredients(recipe);

  return (
    <>
      <PageHeader
        eyebrow="Przepis demo"
        title={recipe.title}
        description={recipe.description}
        actions={
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/co-ugotowac" />}
            variant="outline"
            className="h-11"
          >
            <ArrowLeftIcon aria-hidden="true" /> Wróć
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
              <RecipeFact icon={<ClockIcon />} label="Czas" value={`${recipe.time} min`} />
              <RecipeFact icon={<UsersIcon />} label="Porcje" value="2 osoby" />
              <RecipeFact icon={<ChefHatIcon />} label="Poziom" value={recipe.difficulty} />
              <RecipeFact icon={<FlameIcon />} label="Energia" value={`${recipe.calories} kcal`} />
            </div>
          </section>

          <section className="app-card p-5 sm:p-6">
            <h2 className="text-xl font-extrabold">Przygotowanie</h2>
            <ol className="mt-5 space-y-5">
              {recipe.steps.map((step, index) => (
                <li key={step} className="flex gap-4">
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
            <h2 className="text-xl font-extrabold">Składniki</h2>
            <Badge variant="secondary">2 porcje</Badge>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.name} className="flex min-h-14 items-center gap-3 py-2">
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
          <div className="mt-5 rounded-lg bg-muted p-4">
            <p className="text-sm font-bold">
              {missing.length === 1 ? "Brakuje 1 produktu" : `Brakuje ${missing.length} produktów`}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Brakujące składniki możesz od razu zapisać na liście zakupów.
            </p>
          </div>
          <AddMissingItemsButton
            names={missing.map((ingredient) => ingredient.name)}
            className="mt-4 w-full"
          />
        </aside>
      </div>
    </>
  );
}

function RecipeFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <div className="mb-2 text-primary [&_svg]:size-5" aria-hidden="true">{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}
