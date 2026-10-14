"use client";

import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import type { Recipe } from "@/lib/demo-recipes";
import {
  addCookingRecord, removeCustomRecipe, replaceCustomRecipe, toggleFavorite,
  type CustomRecipe,
} from "@/lib/recipe-library";

export function useRecipeLibrary() {
  return useDashboardData().recipeLibrary;
}

export function useRecipeLibraryActions() {
  const { updateRecipeLibrary } = useDashboardData();
  return {
    saveCustomRecipe: (recipe: CustomRecipe) => updateRecipeLibrary((library) => ({
      ...library, customRecipes: [recipe, ...library.customRecipes],
    })),
    updateCustomRecipe: (recipe: CustomRecipe) => updateRecipeLibrary((library) => replaceCustomRecipe(library, recipe)),
    deleteCustomRecipe: (slug: string) => updateRecipeLibrary((library) => removeCustomRecipe(library, slug)),
    changeFavorite: (slug: string) => updateRecipeLibrary((library) => toggleFavorite(library, slug)),
    recordCooking: (recipe: Pick<Recipe, "slug" | "title" | "cuisine">) =>
      updateRecipeLibrary((library) => addCookingRecord(library, recipe, crypto.randomUUID(), new Date().toISOString())),
  };
}
