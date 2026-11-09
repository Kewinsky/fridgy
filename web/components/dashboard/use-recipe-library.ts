"use client";

import { useDashboardData } from "@/components/dashboard/dashboard-data-provider";
import type { Recipe } from "@/lib/demo-recipes";
import {
  addCookingRecord, toggleFavorite,
  type CustomRecipe,
} from "@/lib/recipe-library";

export function useRecipeLibrary() {
  return useDashboardData().recipeLibrary;
}

export function useRecipeLibraryActions() {
  const { updateRecipeLibrary, saveCustomRecipe, updateCustomRecipe, deleteCustomRecipe } = useDashboardData();
  return {
    saveCustomRecipe: (recipe: CustomRecipe) => saveCustomRecipe(recipe),
    updateCustomRecipe: (recipe: CustomRecipe) => updateCustomRecipe(recipe),
    deleteCustomRecipe: (slug: string) => deleteCustomRecipe(slug),
    changeFavorite: (slug: string) => updateRecipeLibrary((library) => toggleFavorite(library, slug)),
    recordCooking: (recipe: Pick<Recipe, "slug" | "title" | "cuisine">) =>
      updateRecipeLibrary((library) => addCookingRecord(library, recipe, crypto.randomUUID(), new Date().toISOString())),
  };
}
