import { z } from "zod";
import type { StoredRecipe } from "./recipe-library.ts";
import { cleanIngredientName } from "./demo-recipes.ts";

const ingredientSchema = z.object({
  name: z.string().trim().min(1).max(150).transform(cleanIngredientName).pipe(z.string().min(1)),
  quantity: z.number().positive().finite().max(100000),
  unit: z.enum(["g", "kg", "ml", "l", "szt."]),
});

export const generatedRecipeSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(1000),
  time: z.number().int().min(1).max(480),
  difficulty: z.string().trim().min(1).max(50),
  cuisine: z.string().trim().min(1).max(100),
  servings: z.number().int().min(1).max(20),
  calories: z.number().int().positive().max(5000),
  macros: z.object({
    protein: z.number().nonnegative().finite().max(500),
    carbs: z.number().nonnegative().finite().max(500),
    fat: z.number().nonnegative().finite().max(500),
  }),
  ingredients: z.array(ingredientSchema).min(1).max(40),
  steps: z.array(z.string().trim().min(1).max(1000)).min(1).max(30),
});

export function prepareGeneratedRecipe(output: unknown, id: string, createdAt = new Date().toISOString()): StoredRecipe {
  const data = generatedRecipeSchema.parse(output);
  return {
    ...data,
    slug: `ai-${z.uuid().parse(id)}`,
    source: "ai",
    nutritionSource: "estimate",
    createdAt,
    ingredients: data.ingredients.map((ingredient) => ({
      ...ingredient,
      amount: `${ingredient.quantity} ${ingredient.unit}`,
      available: false,
    })),
    // shortcut: AI cannot verify product allergens, add verified product data before declaring any recipe safe.
  };
}
