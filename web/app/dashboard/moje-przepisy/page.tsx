import type { Metadata } from "next";

import { RecipeLibraryPage } from "@/components/dashboard/recipe-library-page";

export const metadata: Metadata = {
  title: "Moje przepisy",
  description: "Ulubione przepisy, własne dania i historia gotowania.",
};

export default function RecipeLibraryRoute() {
  return <RecipeLibraryPage />;
}
