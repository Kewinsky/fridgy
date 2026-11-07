import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RecipeLibraryPage } from "@/components/dashboard/recipe-library-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RecipeLibrary");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function RecipeLibraryRoute() {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 900));
  }
  return <RecipeLibraryPage />;
}
