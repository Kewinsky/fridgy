"use client";

import { useSyncExternalStore } from "react";

import type { Recipe } from "@/lib/demo-recipes";
import {
  addCookingRecord,
  emptyRecipeLibrary,
  readRecipeLibrary,
  removeCustomRecipe,
  RECIPE_LIBRARY_STORAGE_KEY,
  replaceCustomRecipe,
  toggleFavorite,
  writeRecipeLibrary,
  type CustomRecipe,
  type RecipeLibrary,
} from "@/lib/recipe-library";

const RECIPE_LIBRARY_CHANGE_EVENT = "fridgy-recipe-library-change";
let cachedStorageValue: string | null | undefined;
let cachedLibrary = emptyRecipeLibrary;

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(RECIPE_LIBRARY_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(RECIPE_LIBRARY_CHANGE_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  const storageValue = window.localStorage.getItem(RECIPE_LIBRARY_STORAGE_KEY);
  if (storageValue !== cachedStorageValue) {
    cachedStorageValue = storageValue;
    cachedLibrary = readRecipeLibrary(window.localStorage);
  }
  return cachedLibrary;
}

function getServerSnapshot() {
  return emptyRecipeLibrary;
}

function updateLibrary(update: (library: RecipeLibrary) => RecipeLibrary) {
  const nextLibrary = update(readRecipeLibrary(window.localStorage));
  writeRecipeLibrary(window.localStorage, nextLibrary);
  window.dispatchEvent(new Event(RECIPE_LIBRARY_CHANGE_EVENT));
}

export function useRecipeLibrary() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveCustomRecipe(recipe: CustomRecipe) {
  updateLibrary((library) => ({
    ...library,
    customRecipes: [recipe, ...library.customRecipes],
  }));
}

export function updateCustomRecipe(recipe: CustomRecipe) {
  updateLibrary((library) => replaceCustomRecipe(library, recipe));
}

export function deleteCustomRecipe(slug: string) {
  updateLibrary((library) => removeCustomRecipe(library, slug));
}

export function changeFavorite(slug: string) {
  updateLibrary((library) => toggleFavorite(library, slug));
}

export function recordCooking(recipe: Pick<Recipe, "slug" | "title" | "cuisine">) {
  updateLibrary((library) =>
    addCookingRecord(library, recipe, crypto.randomUUID(), new Date().toISOString()),
  );
}
