"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { deleteCustomRecipe, finishCookingSession, persistInventory, persistRecipeLibrary, persistShoppingItems, readDashboardData, readInventory, readShoppingItems, saveCustomRecipe, updateCustomRecipe } from "@/app/dashboard/data-actions";
import type { Recipe } from "@/lib/demo-recipes";
import type { DashboardData } from "@/lib/dashboard-data";
import type { DemoProduct } from "@/lib/demo-data";
import type { CustomRecipe, RecipeLibrary, StoredRecipe } from "@/lib/recipe-library";
import type { ShoppingItem } from "@/lib/shopping-list";

type DashboardStore = DashboardData & {
  updateInventory: (update: (current: DemoProduct[]) => DemoProduct[]) => Promise<void>;
  refreshInventory: () => Promise<void>;
  updateShoppingItems: (update: (current: ShoppingItem[]) => ShoppingItem[]) => Promise<void>;
  updateRecipeLibrary: (update: (current: RecipeLibrary) => RecipeLibrary) => Promise<void>;
  saveCustomRecipe: (recipe: CustomRecipe) => Promise<void>;
  updateCustomRecipe: (recipe: CustomRecipe) => Promise<void>;
  deleteCustomRecipe: (slug: string) => Promise<void>;
  addRecipes: (recipes: StoredRecipe[]) => void;
  finishCooking: (recipe: Pick<Recipe, "slug" | "title" | "cuisine">, deductions: Array<{ productId: string; amount: number }>) => Promise<void>;
  setDeductionMode: (mode: DashboardData["deductionMode"]) => void;
  setDietPreferences: (preferences: Pick<DashboardData, "diet" | "allergies" | "excludedIngredients">) => void;
  setDateFormat: (format: DashboardData["dateFormat"]) => void;
};

const DashboardContext = createContext<DashboardStore | null>(null);

export function DashboardDataProvider({ initialData, children }: { initialData: DashboardData; children: ReactNode }) {
  const [products, setProducts] = useState(initialData.products);
  const [shoppingItems, setShoppingItems] = useState(initialData.shoppingItems);
  const [recipeLibrary, setRecipeLibrary] = useState(initialData.recipeLibrary);
  const [recipes, setRecipes] = useState(initialData.recipes);
  const [deductionMode, setDeductionMode] = useState(initialData.deductionMode);
  const [dietPreferences, setDietPreferences] = useState({ diet: initialData.diet, allergies: initialData.allergies, excludedIngredients: initialData.excludedIngredients });
  const [dateFormat, setDateFormat] = useState(initialData.dateFormat);

  useEffect(() => {
    function refreshOnFocus() {
      if (document.visibilityState !== "visible") return;
      void readDashboardData().then((data) => {
        if (data.householdId !== initialData.householdId) {
          window.location.reload();
          return;
        }
        setProducts(data.products);
        setShoppingItems(data.shoppingItems);
        setRecipeLibrary(data.recipeLibrary);
        setRecipes(data.recipes);
        setDeductionMode(data.deductionMode);
        setDietPreferences({ diet: data.diet, allergies: data.allergies, excludedIngredients: data.excludedIngredients });
        setDateFormat(data.dateFormat);
      }).catch(() => {});
    }
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [initialData.householdId]);

  async function updateInventory(update: (current: DemoProduct[]) => DemoProduct[]) {
    const next = update(products);
    const previous = new Map(products.map((product) => [product.id, product]));
    const nextIds = new Set(next.map((product) => product.id));
    const changed = next.filter((product) => JSON.stringify(product) !== JSON.stringify(previous.get(product.id)));
    const removed = products.filter((product) => !nextIds.has(product.id)).map((product) => product.id);
    if (!changed.length && !removed.length) return;
    setProducts(await persistInventory(changed, removed, initialData.householdId));
  }

  async function refreshInventory() {
    setProducts(await readInventory(initialData.householdId));
  }

  async function updateShoppingItems(update: (current: ShoppingItem[]) => ShoppingItem[]) {
    const next = update(shoppingItems);
    const previous = new Map(shoppingItems.map((item) => [item.id, item]));
    const nextIds = new Set(next.map((item) => item.id));
    const changed = next.filter((item) => JSON.stringify(item) !== JSON.stringify(previous.get(item.id)));
    const removed = shoppingItems.filter((item) => !nextIds.has(item.id)).map((item) => item.id);
    if (!changed.length && !removed.length) return;
    setShoppingItems(next);
    try {
      await persistShoppingItems(changed, removed, initialData.householdId);
    } catch (error) {
      setShoppingItems(await readShoppingItems(initialData.householdId).catch(() => shoppingItems));
      throw error;
    }
  }

  async function updateRecipeLibrary(update: (current: RecipeLibrary) => RecipeLibrary) {
    setRecipeLibrary(await persistRecipeLibrary(update(recipeLibrary)));
  }

  async function saveCustom(recipe: CustomRecipe) {
    const saved = await saveCustomRecipe(recipe);
    setRecipes((current) => [saved, ...current]);
  }

  async function updateCustom(recipe: CustomRecipe) {
    const saved = await updateCustomRecipe(recipe);
    setRecipes((current) => current.map((item) => item.slug === saved.slug ? saved : item));
  }

  async function deleteCustom(slug: string) {
    await deleteCustomRecipe(slug);
    setRecipes((current) => current.filter((item) => item.slug !== slug));
    setRecipeLibrary((current) => ({ ...current, favoriteSlugs: current.favoriteSlugs.filter((item) => item !== slug) }));
  }

  async function finishCooking(recipe: Pick<Recipe, "slug" | "title" | "cuisine">, deductions: Array<{ productId: string; amount: number }>) {
    const data = await finishCookingSession(recipe, deductions, initialData.householdId);
    setProducts(data.products);
    setRecipeLibrary(data.recipeLibrary);
    setRecipes(data.recipes);
  }

  return (
    <DashboardContext.Provider value={{
      ...initialData, ...dietPreferences, products, shoppingItems, recipeLibrary, recipes, deductionMode, dateFormat,
      updateInventory, refreshInventory, updateShoppingItems, updateRecipeLibrary,
      saveCustomRecipe: saveCustom, updateCustomRecipe: updateCustom, deleteCustomRecipe: deleteCustom,
      addRecipes: (added) => setRecipes((current) => [...added, ...current]),
      finishCooking, setDeductionMode, setDietPreferences, setDateFormat,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const store = useContext(DashboardContext);
  if (!store) throw new Error("DashboardDataProvider is missing");
  return store;
}
