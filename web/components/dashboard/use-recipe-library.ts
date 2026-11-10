"use client";

import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import type { CustomRecipe } from "@/lib/recipe-library";

export function useRecipeLibrary() {
  return useDashboardData().recipeLibrary;
}

export function useRecipeLibraryActions() {
  const { toggleFavorite, saveCustomRecipe, updateCustomRecipe, deleteCustomRecipe } = useDashboardData();
  return {
    saveCustomRecipe: (recipe: CustomRecipe) => saveCustomRecipe(recipe),
    updateCustomRecipe: (recipe: CustomRecipe) => updateCustomRecipe(recipe),
    deleteCustomRecipe: (slug: string) => deleteCustomRecipe(slug),
    changeFavorite: toggleFavorite,
  };
}
