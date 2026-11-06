import "server-only";

import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import type { DemoProduct } from "@/lib/demo-data";
import { emptyRecipeLibrary, type RecipeLibrary } from "@/lib/recipe-library";
import type { ShoppingItem } from "@/lib/shopping-list";
import { createClient } from "@/lib/supabase/server";

export type DashboardData = {
  householdId: string;
  deductionMode: "always" | "never" | "ask";
  diet: "none" | "vegetarian" | "vegan" | "pescatarian";
  allergies: string;
  excludedIngredients: string;
  products: DemoProduct[];
  shoppingItems: ShoppingItem[];
  recipeLibrary: RecipeLibrary;
};

export const getCurrentDashboard = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/login");

  const initialData = await loadDashboardData(supabase, data.claims.sub);
  const { data: household, error: householdError } = await supabase.from("households")
    .select("name,owner_id").eq("id", initialData.householdId).single();
  if (householdError || !household) throw new Error("Could not load household");

  return {
    initialData,
    email: typeof data.claims.email === "string" ? data.claims.email : "Twoje konto",
    householdName: household.name as string,
    isHouseholdOwner: household.owner_id === data.claims.sub,
  };
});

export function productFromRow(row: Record<string, unknown>): DemoProduct {
  return {
    id: String(row.id),
    name: String(row.name),
    quantity: Number(row.quantity),
    unit: String(row.unit),
    category: String(row.category),
    storageLocation: row.storage_location as DemoProduct["storageLocation"],
    estimatedUseBy: String(row.estimated_use_by),
    status: row.status as DemoProduct["status"],
    ...(typeof row.seed_key === "string" ? { seedKey: row.seed_key } : {}),
  };
}

export function productToRow(product: DemoProduct, householdId: string) {
  return {
    id: product.id,
    household_id: householdId,
    name: product.name,
    quantity: product.quantity,
    unit: product.unit,
    category: product.category,
    storage_location: product.storageLocation,
    estimated_use_by: product.estimatedUseBy,
    status: product.status,
    seed_key: product.seedKey ?? null,
  };
}

export async function loadDashboardData(supabase: SupabaseClient, userId: string): Promise<DashboardData> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("household_id,deduction_mode,diet,allergies,excluded_ingredients").eq("user_id", userId).single();
  if (profileError || !profile) throw new Error("Profile is missing. Apply the Supabase migration.");

  const householdId = profile.household_id as string;
  const [products, shopping, recipes] = await Promise.all([
    supabase.from("products").select("*").eq("household_id", householdId).order("created_at"),
    supabase.from("shopping_items").select("*").eq("household_id", householdId).order("created_at"),
    supabase.from("recipe_libraries").select("library").eq("user_id", userId).single(),
  ]);
  if (products.error || shopping.error || recipes.error) throw new Error("Could not load dashboard data.");

  return {
    householdId,
    deductionMode: profile.deduction_mode as DashboardData["deductionMode"],
    diet: profile.diet as DashboardData["diet"],
    allergies: String(profile.allergies ?? ""),
    excludedIngredients: String(profile.excluded_ingredients ?? ""),
    products: (products.data ?? []).map(productFromRow),
    shoppingItems: (shopping.data ?? []).map((item) => ({ id: item.id, name: item.name, done: item.done,
      ...(item.seed_key ? { seedKey: item.seed_key } : {}),
    })),
    recipeLibrary: (recipes.data?.library ?? emptyRecipeLibrary) as RecipeLibrary,
  };
}
