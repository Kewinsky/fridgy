import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { RecipeDetail } from "@/components/dashboard/recipe-detail";
import { demoRecipes } from "@/lib/demo-recipes";
import { localizeDemoRecipe } from "@/lib/demo-localization";
import type { Locale } from "@/i18n/config";

type RecipeRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return demoRecipes.map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({ params }: RecipeRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = demoRecipes.find((item) => item.slug === slug);
  const t = await getTranslations("Recipe");
  const locale = await getLocale() as Locale;
  const displayRecipe = recipe ? localizeDemoRecipe(recipe, locale) : undefined;
  return {
    title: displayRecipe?.title ?? t("recipe"),
    description: displayRecipe?.description,
  };
}

export default async function RecipeRoute({ params }: RecipeRouteProps) {
  const { slug } = await params;
  const recipe = demoRecipes.find((item) => item.slug === slug);
  if (!recipe) notFound();
  const t = await getTranslations("Recipe");

  return (
    <RecipeDetail
      recipe={recipe}
      eyebrow={t("demoRecipe")}
      backHref="/dashboard/co-ugotowac"
      showFavoriteAction={false}
      showCookingStats
    />
  );
}
