"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { finishCookingSession, persistInventory, persistRecipeLibrary, persistShoppingItems, readDashboardData, readInventory } from "@/app/dashboard/data-actions";
import type { Recipe } from "@/lib/demo-recipes";
import type { DashboardData } from "@/lib/dashboard-data";
import type { DemoProduct } from "@/lib/demo-data";
import type { RecipeLibrary } from "@/lib/recipe-library";
import type { ShoppingItem } from "@/lib/shopping-list";

type DashboardStore = DashboardData & {
  updateInventory: (update: (current: DemoProduct[]) => DemoProduct[]) => Promise<void>;
  refreshInventory: () => Promise<void>;
  updateShoppingItems: (update: (current: ShoppingItem[]) => ShoppingItem[]) => Promise<void>;
  updateRecipeLibrary: (update: (current: RecipeLibrary) => RecipeLibrary) => Promise<void>;
  finishCooking: (recipe: Pick<Recipe, "slug" | "title" | "cuisine">, deductions: Array<{ productId: string; amount: number }>) => Promise<void>;
  setDeductionMode: (mode: DashboardData["deductionMode"]) => void;
};

const DashboardContext = createContext<DashboardStore | null>(null);

export function DashboardDataProvider({ initialData, children }: { initialData: DashboardData; children: ReactNode }) {
  const [products, setProducts] = useState(initialData.products);
  const [shoppingItems, setShoppingItems] = useState(initialData.shoppingItems);
  const [recipeLibrary, setRecipeLibrary] = useState(initialData.recipeLibrary);
  const [deductionMode, setDeductionMode] = useState(initialData.deductionMode);

  useEffect(() => {
    function refreshOnFocus() {
      if (document.visibilityState !== "visible") return;
      void readDashboardData().then((data) => {
        setProducts(data.products);
        setShoppingItems(data.shoppingItems);
        setRecipeLibrary(data.recipeLibrary);
        setDeductionMode(data.deductionMode);
      }).catch(() => {});
    }
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, []);

  async function updateInventory(update: (current: DemoProduct[]) => DemoProduct[]) {
    const next = update(products);
    const previous = new Map(products.map((product) => [product.id, product]));
    const nextIds = new Set(next.map((product) => product.id));
    const changed = next.filter((product) => JSON.stringify(product) !== JSON.stringify(previous.get(product.id)));
    const removed = products.filter((product) => !nextIds.has(product.id)).map((product) => product.id);
    if (!changed.length && !removed.length) return;
    setProducts(await persistInventory(changed, removed));
  }

  async function refreshInventory() {
    setProducts(await readInventory());
  }

  async function updateShoppingItems(update: (current: ShoppingItem[]) => ShoppingItem[]) {
    const next = update(shoppingItems);
    const previous = new Map(shoppingItems.map((item) => [item.id, item]));
    const nextIds = new Set(next.map((item) => item.id));
    const changed = next.filter((item) => JSON.stringify(item) !== JSON.stringify(previous.get(item.id)));
    const removed = shoppingItems.filter((item) => !nextIds.has(item.id)).map((item) => item.id);
    if (!changed.length && !removed.length) return;
    setShoppingItems(await persistShoppingItems(changed, removed));
  }

  async function updateRecipeLibrary(update: (current: RecipeLibrary) => RecipeLibrary) {
    setRecipeLibrary(await persistRecipeLibrary(update(recipeLibrary)));
  }

  async function finishCooking(recipe: Pick<Recipe, "slug" | "title" | "cuisine">, deductions: Array<{ productId: string; amount: number }>) {
    const data = await finishCookingSession(recipe, deductions);
    setProducts(data.products);
    setRecipeLibrary(data.recipeLibrary);
  }

  return (
    <DashboardContext.Provider value={{
      ...initialData, products, shoppingItems, recipeLibrary, deductionMode,
      updateInventory, refreshInventory, updateShoppingItems, updateRecipeLibrary, finishCooking, setDeductionMode,
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
