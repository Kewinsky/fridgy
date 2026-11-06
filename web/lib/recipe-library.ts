import { getIngredientQuantity, parseIngredientAmount, recipeAllergens, type Recipe, type RecipeAllergen } from "./demo-recipes.ts";

export type CustomRecipe = Recipe & {
  createdAt: string;
};

export type CookingRecord = {
  id: string;
  recipeSlug: string;
  recipeTitle: string;
  cuisine: string;
  cookedAt: string;
};

export type RecipeLibrary = {
  version: 1;
  customRecipes: CustomRecipe[];
  favoriteSlugs: string[];
  history: CookingRecord[];
};

export type RecipeDraft = {
  title: string;
  imagePath?: string;
  description: string;
  cuisine: string;
  time: number;
  activeTime?: number;
  servings: number;
  ingredients: string;
  steps: string;
  nutrition?: { calories: number; protein: number; carbs: number; fat: number };
  allergens?: RecipeAllergen[];
  dietTags?: Recipe["dietTags"];
};

export const emptyRecipeLibrary: RecipeLibrary = {
  version: 1,
  customRecipes: [],
  favoriteSlugs: [],
  history: [],
};

export function isCustomRecipe(value: unknown): value is CustomRecipe {
  if (!value || typeof value !== "object") return false;
  const recipe = value as CustomRecipe;
  return (
    typeof recipe.slug === "string" &&
    typeof recipe.title === "string" &&
    typeof recipe.description === "string" &&
    typeof recipe.time === "number" &&
    typeof recipe.difficulty === "string" &&
    (recipe.calories === undefined || typeof recipe.calories === "number") &&
    typeof recipe.cuisine === "string" &&
    typeof recipe.servings === "number" &&
    Array.isArray(recipe.ingredients) &&
    recipe.ingredients.every(
      (ingredient) =>
        ingredient &&
        typeof ingredient === "object" &&
        typeof ingredient.name === "string" &&
        (typeof ingredient.amount === "string" || getIngredientQuantity(ingredient) !== null) &&
        typeof ingredient.available === "boolean",
    ) &&
    Array.isArray(recipe.steps) &&
    recipe.steps.every((step) => typeof step === "string") &&
    typeof recipe.createdAt === "string"
  );
}

export function toggleFavorite(library: RecipeLibrary, slug: string): RecipeLibrary {
  const favoriteSlugs = library.favoriteSlugs.includes(slug)
    ? library.favoriteSlugs.filter((favoriteSlug) => favoriteSlug !== slug)
    : [...library.favoriteSlugs, slug];
  return { ...library, favoriteSlugs };
}

export function replaceCustomRecipe(
  library: RecipeLibrary,
  recipe: CustomRecipe,
): RecipeLibrary {
  return {
    ...library,
    customRecipes: library.customRecipes.map((item) =>
      item.slug === recipe.slug ? recipe : item,
    ),
  };
}

export function removeCustomRecipe(
  library: RecipeLibrary,
  slug: string,
): RecipeLibrary {
  return {
    ...library,
    customRecipes: library.customRecipes.filter((recipe) => recipe.slug !== slug),
    favoriteSlugs: library.favoriteSlugs.filter((favoriteSlug) => favoriteSlug !== slug),
  };
}

export function addCookingRecord(
  library: RecipeLibrary,
  recipe: Pick<Recipe, "slug" | "title" | "cuisine">,
  id: string,
  cookedAt: string,
): RecipeLibrary {
  return {
    ...library,
    history: [
      { id, recipeSlug: recipe.slug, recipeTitle: recipe.title, cuisine: recipe.cuisine, cookedAt },
      ...library.history,
    ],
  };
}

export function getCookingCount(library: RecipeLibrary, slug: string) {
  return library.history.filter((record) => record.recipeSlug === slug).length;
}

export function getFavoriteCuisine(library: RecipeLibrary) {
  const counts = new Map<string, number>();
  for (const record of library.history) {
    counts.set(record.cuisine, (counts.get(record.cuisine) ?? 0) + 1);
  }
  let favorite = "Brak danych";
  let highestCount = 0;
  for (const [cuisine, count] of counts) {
    if (count > highestCount) {
      favorite = cuisine;
      highestCount = count;
    }
  }
  return favorite;
}

export function createCustomRecipe(draft: RecipeDraft, slug: string, createdAt: string): CustomRecipe {
  const ingredients = draft.ingredients.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [name, ...amountParts] = line.split("|");
    const amount = amountParts.join("|").trim() || "do smaku";
    return { name: name.trim(), amount, ...parseIngredientAmount(amount), available: true };
  });
  const steps = draft.steps.split("\n").map((step) => step.trim()).filter(Boolean);

  return {
    slug,
    imagePath: draft.imagePath,
    title: draft.title.trim(),
    description: draft.description.trim() || "Twój własny przepis.",
    cuisine: draft.cuisine,
    time: draft.time,
    activeTime: draft.activeTime,
    servings: draft.servings,
    difficulty: "Własny przepis",
    ...(draft.nutrition ? {
      calories: draft.nutrition.calories,
      macros: { protein: draft.nutrition.protein, carbs: draft.nutrition.carbs, fat: draft.nutrition.fat },
      nutritionSource: "author" as const,
    } : {}),
    ...(draft.allergens ? { allergens: draft.allergens.filter((allergen) => recipeAllergens.includes(allergen)) } : {}),
    ...(draft.dietTags ? { dietTags: draft.dietTags } : {}),
    ingredients,
    steps,
    createdAt,
  };
}

export function slugifyRecipeTitle(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pl")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
