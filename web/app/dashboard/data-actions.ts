"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { productFromRow, productToRow } from "@/lib/dashboard-data";
import type { DemoProduct } from "@/lib/demo-data";
import type { ShoppingItem } from "@/lib/shopping-list";
import type { RecipeLibrary } from "@/lib/recipe-library";
import type { Recipe } from "@/lib/demo-recipes";
import { loadDashboardData } from "@/lib/dashboard-data";

const productSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(150),
  quantity: z.number().finite().min(0),
  unit: z.string().trim().min(1).max(30),
  category: z.string().trim().min(1).max(100),
  storageLocation: z.enum(["Lodówka", "Zamrażarka", "Spiżarnia"]),
  estimatedUseBy: z.iso.date(),
  status: z.enum(["active", "consumed"]),
  seedKey: z.string().max(50).optional(),
});
const shoppingSchema = z.object({ id: z.uuid(), name: z.string().trim().min(1).max(150), done: z.boolean(), seedKey: z.string().max(50).optional() });
const librarySchema = z.object({
  version: z.literal(1),
  customRecipes: z.array(z.record(z.string(), z.unknown())).max(500),
  favoriteSlugs: z.array(z.string().max(150)).max(1000),
  history: z.array(z.record(z.string(), z.unknown())).max(5000),
});

async function authorizedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("household_id").eq("user_id", data.user.id).single();
  if (profileError || !profile) throw new Error("Profile not found");
  return { supabase, userId: data.user.id, householdId: profile.household_id as string };
}

export async function persistInventory(changed: DemoProduct[], removedIds: string[]) {
  const validProducts = z.array(productSchema).max(100).parse(changed);
  const validIds = z.array(z.uuid()).max(100).parse(removedIds);
  const { supabase, householdId } = await authorizedClient();
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

export async function readInventory() {
  const { supabase, householdId } = await authorizedClient();
  const { data, error } = await supabase.from("products").select("*").eq("household_id", householdId).order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map(productFromRow);
}

export async function readDashboardData() {
  const { supabase, userId } = await authorizedClient();
  return loadDashboardData(supabase, userId);
}

export async function persistShoppingItems(changed: ShoppingItem[], removedIds: string[]) {
  const validItems = z.array(shoppingSchema).max(100).parse(changed);
  const validIds = z.array(z.uuid()).max(100).parse(removedIds);
  const { supabase, householdId } = await authorizedClient();
  if (validItems.length) {
    const { error } = await supabase.from("shopping_items").upsert(validItems.map((item) => ({
      id: item.id, name: item.name, done: item.done, seed_key: item.seedKey ?? null, household_id: householdId,
    })));
    if (error) throw new Error(error.message);
  }
  if (validIds.length) {
    const { error } = await supabase.from("shopping_items").delete().eq("household_id", householdId).in("id", validIds);
    if (error) throw new Error(error.message);
  }
  const { data, error } = await supabase.from("shopping_items").select("id,name,done,seed_key").eq("household_id", householdId).order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({ id: item.id, name: item.name, done: item.done,
    ...(item.seed_key ? { seedKey: item.seed_key } : {}),
  })) as ShoppingItem[];
}

export async function persistRecipeLibrary(library: RecipeLibrary) {
  const validLibrary = librarySchema.parse(library);
  const { supabase, userId } = await authorizedClient();
  const { error } = await supabase.from("recipe_libraries").update({ library: validLibrary }).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return library;
}

export async function saveManualReceipt(items: Array<{
  name: string; quantity: number; unit: string; storageLocation: string; category: string; estimatedUseBy: string; price: string;
}>) {
  const validItems = z.array(z.object({
    name: z.string().trim().min(1).max(150),
    quantity: z.number().positive().max(100000),
    unit: z.string().trim().min(1).max(30),
    storageLocation: z.enum(["Lodówka", "Zamrażarka", "Spiżarnia"]),
    category: z.enum(["Owoce", "Nabiał", "Warzywa", "Mięso", "Mrożonki", "Ryby", "Pieczywo", "Sypkie", "Przetwory"]),
    estimatedUseBy: z.iso.date(),
    price: z.string().max(30),
  })).min(1).max(100).parse(items);
  const { supabase } = await authorizedClient();
  const { error } = await supabase.rpc("save_manual_receipt", { receipt_items: validItems });
  if (error) throw new Error(error.message);
}

export async function finishCookingSession(recipe: Pick<Recipe, "slug" | "title" | "cuisine">, deductions: Array<{ productId: string; amount: number }>) {
  const validRecipe = z.object({
    slug: z.string().trim().min(1).max(150),
    title: z.string().trim().min(1).max(200),
    cuisine: z.string().trim().min(1).max(100),
  }).parse(recipe);
  const validDeductions = z.array(z.object({ productId: z.uuid(), amount: z.number().positive().finite() })).max(100).parse(deductions);
  const { supabase, userId } = await authorizedClient();
  const { error } = await supabase.rpc("finish_fridgy_cooking", {
    recipe_slug: validRecipe.slug,
    recipe_title: validRecipe.title,
    recipe_cuisine: validRecipe.cuisine,
    deductions: validDeductions,
  });
  if (error) throw new Error(error.message);
  return loadDashboardData(supabase, userId);
}
