"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { RecipeDetail } from "@/components/dashboard/recipe-detail";
import { BrandIcon } from "@/components/brand-icon";
import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import { Button } from "@/components/ui/button";

export function CustomRecipePage({ slug }: { slug: string }) {
  const t = useTranslations("RecipeLibrary");
  const { recipes } = useDashboardData();
  const recipe = recipes.find((item) => item.slug === slug);

  if (!recipe) {
    return (
      <section className="app-card px-5 py-12 text-center">
        <BrandIcon name="no_results" className="mx-auto size-20" />
        <h1 className="mt-4 text-xl font-extrabold">{t("notFound.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("notFound.description")}</p>
        <Button nativeButton={false} render={<Link href="/dashboard/moje-przepisy" />} className="mt-5 h-11">
          {t("notFound.action")}
        </Button>
      </section>
    );
  }

  return <RecipeDetail recipe={recipe} eyebrow={t("yourRecipe")} backHref="/dashboard/moje-przepisy" />;
}
