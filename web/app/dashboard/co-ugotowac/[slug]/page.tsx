import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RecipeDetail } from "@/components/dashboard/recipe-detail";
import { demoRecipes } from "@/lib/demo-recipes";

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

  return (
    <RecipeDetail
      recipe={recipe}
      eyebrow="Przepis demo"
      backHref="/dashboard/co-ugotowac"
      showFavoriteAction={false}
      showCookingStats
    />
  );
}
