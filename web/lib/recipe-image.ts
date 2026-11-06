import { validateReceiptImage } from "./receipt-image.ts";
import type { Recipe } from "./demo-recipes.ts";

export const RECIPE_IMAGE_BUCKET = "recipe-images";
export const MAX_RECIPE_IMAGE_MB = 8;
const extensions = new Map([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
]);

export type RecipeImageError = "invalid" | "tooLarge";

export function isRecipeImageFilename(filename: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|jpeg|png|webp)$/.test(filename);
}

export async function validateRecipeImage(file: File): Promise<RecipeImageError | null> {
  if (file.size > MAX_RECIPE_IMAGE_MB * 1024 * 1024) return "tooLarge";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || extensions.get(extension) !== file.type) return "invalid";
  return await validateReceiptImage(file) ? "invalid" : null;
}

export function getRecipeImageSrc(recipe: Pick<Recipe, "image" | "imagePath">): string | null {
  if (recipe.image) return recipe.image;
  if (recipe.imagePath) return `/api/recipe-images/${encodeURIComponent(recipe.imagePath)}`;
  return null;
}

