"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { productFromRow, productToRow } from "@/lib/dashboard-data";
import { isPrioritizableProduct, type DemoProduct } from "@/lib/demo-data";
import type { ShoppingItem } from "@/lib/shopping-list";
import type { CustomRecipe } from "@/lib/recipe-library";
import { validateCustomRecipe } from "@/lib/recipe-store";
import { prepareGeneratedRecipe } from "@/lib/generated-recipes";
import { collectGeneratedRecipes, generationInputSchema, type GenerationInput } from "@/lib/recipe-generation";
import type { Recipe } from "@/lib/demo-recipes";
import { loadDashboardData } from "@/lib/dashboard-data";
import { productCategories } from "@/components/dashboard/product-category-options";
import { extractRecipeDraft, fetchPublicDescription, importLocaleSchema, parseImportUrl, type ImportRecipeResult } from "@/lib/recipe-import";

const productSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(150),
  quantity: z.number().finite().min(0),
  unit: z.string().trim().min(1).max(30),
  category: z.string().trim().min(1).max(100),
  storageLocation: z.enum(["Lodówka", "Zamrażarka", "Spiżarnia"]),
  estimatedUseBy: z.iso.date(),
  status: z.enum(["active", "consumed"]),
  isDemo: z.boolean().optional(),
  seedKey: z.string().max(50).optional(),
});
const shoppingSchema = z.object({ id: z.uuid(), name: z.string().trim().min(1).max(150), done: z.boolean(), isDemo: z.boolean().optional(), seedKey: z.string().max(50).optional() });

async function authorizedClient(expectedHouseholdId?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("household_id").eq("user_id", data.user.id).single();
  if (profileError || !profile) throw new Error("Profile not found");
  if (expectedHouseholdId && profile.household_id !== z.uuid().parse(expectedHouseholdId))
    throw new Error("Active household changed. Refresh and try again.");
  return { supabase, userId: data.user.id, householdId: profile.household_id as string };
}

export async function persistInventory(changed: DemoProduct[], removedIds: string[], expectedHouseholdId: string) {
  const validProducts = z.array(productSchema).max(100).parse(changed);
  const validIds = z.array(z.uuid()).max(100).parse(removedIds);
  const { supabase, householdId } = await authorizedClient(expectedHouseholdId);
  if (validProducts.length) {
    const { error } = await supabase.from("products").upsert(validProducts.map((product) => productToRow(product, householdId)));
    if (error) throw new Error(error.message);
  }
  if (validIds.length) {
    const { error } = await supabase.from("products").delete().eq("household_id", householdId).in("id", validIds);
    if (error) throw new Error(error.message);
  }
  const { data, error } = await supabase.from("products").select("*").eq("household_id", householdId).order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map(productFromRow);
}

export async function readInventory(expectedHouseholdId: string) {
  const { supabase, householdId } = await authorizedClient(expectedHouseholdId);
  const { data, error } = await supabase.from("products").select("*").eq("household_id", householdId).order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map(productFromRow);
}

export async function readDashboardData() {
  const { supabase, userId } = await authorizedClient();
  return loadDashboardData(supabase, userId);
}

export async function persistShoppingItems(changed: ShoppingItem[], removedIds: string[], expectedHouseholdId: string) {
  const validItems = z.array(shoppingSchema).max(100).parse(changed);
  const validIds = z.array(z.uuid()).max(100).parse(removedIds);
  const { supabase, householdId } = await authorizedClient(expectedHouseholdId);
  if (validItems.length) {
    const { error } = await supabase.from("shopping_items").upsert(validItems.map((item) => ({
      id: item.id, name: item.name, done: item.done, is_demo: item.isDemo ?? false, seed_key: item.seedKey ?? null, household_id: householdId,
    })));
    if (error) throw new Error(error.message);
  }
  if (validIds.length) {
    const { error } = await supabase.from("shopping_items").delete().eq("household_id", householdId).in("id", validIds);
    if (error) throw new Error(error.message);
  }
}

export async function readShoppingItems(expectedHouseholdId: string): Promise<ShoppingItem[]> {
  const { supabase, householdId } = await authorizedClient(expectedHouseholdId);
  const { data, error } = await supabase.from("shopping_items")
    .select("id,name,done,is_demo,seed_key").eq("household_id", householdId).order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({ id: item.id, name: item.name, done: item.done, isDemo: item.is_demo === true,
    ...(item.seed_key ? { seedKey: item.seed_key } : {}),
  }));
}

export async function toggleRecipeFavorite(slug: string, expectedHouseholdId: string): Promise<boolean> {
  const validSlug = z.string().trim().min(1).max(150).parse(slug);
  const { supabase } = await authorizedClient(expectedHouseholdId);
  const { data, error } = await supabase.rpc("toggle_fridgy_household_favorite", {
    target_slug: validSlug, expected_household: expectedHouseholdId,
  });
  if (error) throw new Error(error.message);
  return z.boolean().parse(data);
}

export async function saveCustomRecipe(recipe: CustomRecipe, expectedHouseholdId: string) {
  const valid = validateCustomRecipe(recipe);
  const { supabase, userId, householdId } = await authorizedClient(expectedHouseholdId);
  const { error } = await supabase.from("recipes").insert({ user_id: userId, household_id: householdId, slug: valid.slug, source: "custom", recipe: valid, created_at: valid.createdAt });
  if (error) throw new Error(error.message);
  return { ...valid, createdBy: userId, isFavorite: false };
}

export async function importRecipeFromUrl(value: string, locale: string): Promise<ImportRecipeResult> {
  await authorizedClient();
  const url = parseImportUrl(value);
  if (!url) return { error: "invalidUrl" };
  if (!importLocaleSchema.safeParse(locale).success) return { error: "unsupported" };
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { error: "serviceUnavailable" };
  let description: string | null;
  try {
    description = await fetchPublicDescription(url);
  } catch {
    return { error: "unavailable" };
  }
  if (!description) return { error: "unavailable" };
  try {
    return await extractRecipeDraft(key, description, locale);
  } catch {
    return { error: "serviceUnavailable" };
  }
}

export async function updateCustomRecipe(recipe: CustomRecipe, expectedHouseholdId: string) {
  const valid = validateCustomRecipe(recipe);
  const { supabase, householdId } = await authorizedClient(expectedHouseholdId);
  const { data, error } = await supabase.from("recipes").update({ recipe: valid })
    .eq("household_id", householdId).eq("slug", valid.slug).eq("source", "custom").select("slug,user_id,is_favorite").single();
  if (error || !data) throw new Error(error?.message ?? "Recipe not found");
  return { ...valid, createdBy: (data.user_id as string | null) ?? undefined, isFavorite: data.is_favorite === true };
}

export async function deleteCustomRecipe(slug: string, expectedHouseholdId: string) {
  const validSlug = z.string().trim().min(1).max(150).parse(slug);
  const { supabase } = await authorizedClient(expectedHouseholdId);
  const { error } = await supabase.rpc("delete_fridgy_custom_recipe", { target_slug: validSlug, expected_household: expectedHouseholdId });
  if (error) throw new Error(error.message);
}

export async function generateRecipes(input: GenerationInput, expectedHouseholdId: string) {
  const validInput = generationInputSchema.parse(input);
  const { supabase, userId, householdId } = await authorizedClient(expectedHouseholdId);
  const dashboard = await loadDashboardData(supabase, userId);
  if (dashboard.householdId !== expectedHouseholdId) throw new Error("Active household changed. Refresh and try again.");
  const selectable = new Set(dashboard.products.filter((product) => isPrioritizableProduct(product)).map((product) => product.id));
  if (validInput.priorityProductIds.some((id) => !selectable.has(id))) {
    return { error: "priorityUnavailable" as const };
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { error: "unavailable" as const };
  if (validInput.shopping === "none" && !dashboard.products.some((product) => product.status === "active" && product.quantity > 0)) {
    return { error: "emptyInventory" as const };
  }
  let batch;
  try {
    batch = await collectGeneratedRecipes(key, validInput, dashboard.products, dashboard, dashboard.recipes);
  } catch (error) {
    if (error instanceof Error && error.message === "AI_RATE_LIMIT") return { error: "rateLimited" as const };
    if (error instanceof Error && error.message === "AI_CONFIGURATION") return { error: "configuration" as const };
    if (error instanceof Error && error.message === "AI_INCOMPLETE") return { error: "incomplete" as const };
    return { error: "unavailable" as const };
  }
  if (!batch.recipes.length) return { error: batch.shoppingBlocked ? "shoppingLimit" as const : "noMatches" as const, message: batch.message };
  const recipes = batch.recipes.map((recipe) => prepareGeneratedRecipe(recipe, crypto.randomUUID()));
  const { error } = await supabase.from("recipes").insert(recipes.map((recipe) => ({
    user_id: userId, household_id: householdId, slug: recipe.slug, source: "ai", recipe, created_at: recipe.createdAt,
  })));
  if (error) throw new Error(error.message);
  return { recipes, partial: recipes.length < 3, message: batch.message };
}

export async function saveManualReceipt(items: Array<{
  name: string; quantity: number; unit: string; storageLocation: string; category: string; estimatedUseBy: string;
}>, expectedHouseholdId: string) {
  const validItems = z.array(z.object({
    name: z.string().trim().min(1).max(150),
    quantity: z.number().positive().max(100000),
    unit: z.string().trim().min(1).max(30),
    storageLocation: z.enum(["Lodówka", "Zamrażarka", "Spiżarnia"]),
    category: z.enum(productCategories),
    estimatedUseBy: z.iso.date(),
  })).min(1).max(100).parse(items);
  const { supabase } = await authorizedClient(expectedHouseholdId);
  const { error } = await supabase.rpc("save_manual_receipt_for_household", {
    receipt_items: validItems, expected_household: expectedHouseholdId,
  });
  if (error) throw new Error(error.message);
}

export async function finishCookingSession(recipe: Pick<Recipe, "slug" | "title" | "cuisine">, deductions: Array<{ productId: string; amount: number }>, expectedHouseholdId: string) {
  const validRecipe = z.object({
    slug: z.string().trim().min(1).max(150),
    title: z.string().trim().min(1).max(200),
    cuisine: z.string().trim().min(1).max(100),
  }).parse(recipe);
  const validDeductions = z.array(z.object({ productId: z.uuid(), amount: z.number().positive().finite() })).max(100).parse(deductions);
  const { supabase, userId } = await authorizedClient(expectedHouseholdId);
  const { error } = await supabase.rpc("finish_fridgy_cooking_for_household", {
    recipe_slug: validRecipe.slug,
    recipe_title: validRecipe.title,
    recipe_cuisine: validRecipe.cuisine,
    deductions: validDeductions,
    expected_household: expectedHouseholdId,
  });
  if (error) throw new Error(error.message);
  return loadDashboardData(supabase, userId);
}
