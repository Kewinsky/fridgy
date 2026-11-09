import "server-only";

import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import type { DemoProduct } from "@/lib/demo-data";
import { emptyRecipeLibrary, type RecipeLibrary, type StoredRecipe } from "@/lib/recipe-library";
import { readStoredRecipes } from "@/lib/recipe-store";
import type { ShoppingItem } from "@/lib/shopping-list";
import { createClient } from "@/lib/supabase/server";

export type DashboardData = {
  userId: string;
  householdId: string;
  username: string;
  avatarPath: string | null;
  deductionMode: "always" | "never" | "ask";
  diet: "none" | "vegetarian" | "vegan" | "pescatarian";
  allergies: string;
  excludedIngredients: string;
  products: DemoProduct[];
  shoppingItems: ShoppingItem[];
  recipeLibrary: RecipeLibrary;
  recipes: StoredRecipe[];
};

export type HouseholdOption = { id: string; name: string; isOwner: boolean };

export const getCurrentDashboard = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/login");

  const initialData = await loadDashboardData(supabase, data.claims.sub);
  const { data: household, error: householdError } = await supabase.from("households")
    .select("name,owner_id").eq("id", initialData.householdId).single();
  if (householdError || !household) throw new Error("Could not load household");
  const { data: memberships, error: membershipsError } = await supabase.from("household_memberships")
    .select("household_id,households(id,name,owner_id)").eq("user_id", data.claims.sub);
  if (membershipsError) throw new Error(membershipsError.message);
  const households: HouseholdOption[] = (memberships ?? []).flatMap((membership) => {
    const home = membership.households as unknown as { id: string; name: string; owner_id: string } | null;
    return home ? [{ id: home.id, name: home.name, isOwner: home.owner_id === data.claims.sub }] : [];
  });

  return {
    initialData,
    email: typeof data.claims.email === "string" ? data.claims.email : "Twoje konto",
    householdName: household.name as string,
    isHouseholdOwner: household.owner_id === data.claims.sub,
    households,
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
    isDemo: row.is_demo === true,
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
    is_demo: product.isDemo ?? false,
    seed_key: product.seedKey ?? null,
  };
}

export async function loadDashboardData(supabase: SupabaseClient, userId: string): Promise<DashboardData> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("household_id,username,avatar_path,deduction_mode,diet,allergies,excluded_ingredients").eq("user_id", userId).single();
  if (profileError || !profile) throw new Error("Profile is missing. Apply the Supabase migration.");

  const householdId = profile.household_id as string;
  const { error: pruneError } = await supabase.rpc("prune_fridgy_recipe_history");
  if (pruneError && pruneError.code !== "PGRST202") throw new Error(pruneError.message);
  const [products, shopping, library, recipes] = await Promise.all([
    supabase.from("products").select("*").eq("household_id", householdId).order("created_at"),
    supabase.from("shopping_items").select("*").eq("household_id", householdId).order("created_at"),
    supabase.from("recipe_libraries").select("library").eq("user_id", userId).single(),
    readStoredRecipes(supabase),
  ]);
  if (products.error || shopping.error || library.error) throw new Error("Could not load dashboard data.");

  return {
    userId,
    householdId,
    username: String(profile.username),
    avatarPath: typeof profile.avatar_path === "string" ? profile.avatar_path : null,
    deductionMode: profile.deduction_mode as DashboardData["deductionMode"],
    diet: profile.diet as DashboardData["diet"],
    allergies: String(profile.allergies ?? ""),
    excludedIngredients: String(profile.excluded_ingredients ?? ""),
    products: (products.data ?? []).map(productFromRow),
    shoppingItems: (shopping.data ?? []).map((item) => ({ id: item.id, name: item.name, done: item.done, isDemo: item.is_demo === true,
      ...(item.seed_key ? { seedKey: item.seed_key } : {}),
    })),
    recipeLibrary: (library.data?.library ?? emptyRecipeLibrary) as RecipeLibrary,
    recipes,
  };
}
