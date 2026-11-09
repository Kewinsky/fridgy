import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RecipeLibraryCards, RecipeLibraryPage, type RecipeLibraryTab } from "@/components/dashboard/recipe-library-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RecipeLibrary");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

function cards(tab: RecipeLibraryTab) {
  return <RecipeLibraryCards tab={tab} />;
}

export default function RecipeLibraryRoute() {
  return <RecipeLibraryPage favorites={cards("favorites")} custom={cards("custom")} history={cards("history")} />;
}
