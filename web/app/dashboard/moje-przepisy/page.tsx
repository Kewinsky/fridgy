import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { RecipeLibraryCards, RecipeLibraryPage, type RecipeLibraryTab } from "@/components/dashboard/recipe-library-page";
import { RecipeCardSkeleton } from "@/components/dashboard/recipe-card-skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RecipeLibrary");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

async function DelayedRecipeCards({ tab }: { tab: RecipeLibraryTab }) {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 900));
  }
  return <RecipeLibraryCards tab={tab} />;
}

function cards(tab: RecipeLibraryTab) {
  return (
    <Suspense fallback={
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => <RecipeCardSkeleton key={index} variant="library" />)}
      </div>
    }>
      <DelayedRecipeCards tab={tab} />
    </Suspense>
  );
}

export default function RecipeLibraryRoute() {
  return <RecipeLibraryPage favorites={cards("favorites")} custom={cards("custom")} history={cards("history")} />;
}
