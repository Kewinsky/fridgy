import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CustomRecipePage } from "@/components/dashboard/custom-recipe-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RecipeLibrary");
  return { title: t("yourRecipe") };
}

export default async function CustomRecipeRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CustomRecipePage slug={slug} />;
}
