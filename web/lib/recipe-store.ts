import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { cleanIngredientName, recipeAllergens } from "./demo-recipes.ts";
import type { CustomRecipe, StoredRecipe } from "./recipe-library.ts";

const storedRecipeSchema = z.object({
  slug: z.string().trim().min(1).max(150),
  source: z.enum(["custom", "ai"]),
  createdAt: z.iso.datetime({ offset: true }),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000),
  time: z.number().int().min(1).max(480),
  activeTime: z.number().int().min(1).max(480).optional(),
  difficulty: z.string().trim().min(1).max(50),
  cuisine: z.string().trim().min(1).max(100),
  servings: z.number().int().min(1).max(20),
  imagePath: z.string().regex(/^[0-9a-f-]{36}\.(?:jpg|jpeg|png|webp)$/).optional(),
  imageOwnerId: z.uuid().optional(),
  ingredients: z.array(z.object({
    name: z.string().trim().min(1).max(150),
    amount: z.string().trim().min(1).max(100),
    quantity: z.number().positive().finite().max(100000).optional(),
    unit: z.string().trim().min(1).max(30).optional(),
    available: z.boolean(),
  })).min(1).max(40),
  steps: z.array(z.string().trim().min(1).max(1000)).min(1).max(30),
  calories: z.number().nonnegative().finite().optional(),
  macros: z.object({ protein: z.number().nonnegative().finite(), carbs: z.number().nonnegative().finite(), fat: z.number().nonnegative().finite() }).optional(),
  nutritionSource: z.enum(["estimate", "author"]).optional(),
  allergens: z.array(z.enum(recipeAllergens)).optional(),
  dietTags: z.array(z.enum(["vegetarian", "vegan", "pescatarian"])).optional(),
});

export function validateStoredRecipe(value: unknown): StoredRecipe {
  return storedRecipeSchema.parse(value);
}

export function validateCustomRecipe(value: unknown): CustomRecipe {
  const recipe = validateStoredRecipe(value);
  if (recipe.source !== "custom") throw new Error("Expected a custom recipe");
  return recipe as CustomRecipe;
}

export async function readStoredRecipes(supabase: SupabaseClient, householdId: string): Promise<StoredRecipe[]> {
  const { data, error } = await supabase.from("recipes").select("slug,source,recipe,created_at,is_demo,is_favorite,user_id")
    .eq("household_id", householdId).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const recipe = {
      ...validateStoredRecipe({ ...(row.recipe as object), slug: row.slug, source: row.source, createdAt: row.created_at }),
      createdBy: row.user_id ?? undefined,
      isFavorite: row.is_favorite === true,
      ...(row.is_demo ? { isDemo: true } : {}),
    };
    if (recipe.source !== "ai") return recipe;
    return { ...recipe, ingredients: recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      name: cleanIngredientName(ingredient.name),
    })) };
  });
}
