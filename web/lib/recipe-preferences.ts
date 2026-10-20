import type { Recipe, RecipeAllergen } from "./demo-recipes.ts";

type Preferences = {
  diet: "none" | "vegetarian" | "vegan" | "pescatarian";
  allergies: string;
  excludedIngredients: string;
};

const allergenAliases: Record<RecipeAllergen, string[]> = {
  gluten: ["gluten", "pszenica", "zyto", "jęczmień", "jéczmien", "wheat", "rye", "barley"],
  crustaceans: ["skorupiaki", "crustaceans"],
  eggs: ["jaja", "jajka", "egg", "eggs"],
  fish: ["ryby", "ryba", "fish"],
  peanuts: ["orzeszki ziemne", "peanuts"],
  soy: ["soja", "soy"],
  milk: ["mleko", "nabiał", "nabial", "milk", "dairy"],
  nuts: ["orzechy", "nuts", "tree nuts", "nüsse", "noix", "frutos secos"],
  celery: ["seler", "celery", "sellerie", "céleri", "apio"],
  mustard: ["gorczyca", "musztarda", "mustard"],
  sesame: ["sezam", "sesame"],
  sulphites: ["siarczyny", "sulfites", "sulphites"],
  lupin: ["łubin", "lupin"],
  molluscs: ["mięczaki", "molluscs"],
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function entries(value: string) {
  return value.split(/[,;\n]/).map(normalize).filter(Boolean);
}

export function getRecipePreferenceConflicts(recipe: Recipe, preferences: Preferences, allergenLabels?: Partial<Record<RecipeAllergen, string>>) {
  const requestedAllergens = entries(preferences.allergies);
  const matchingAllergens = (recipe.allergens ?? []).filter((allergen) =>
    requestedAllergens.some((entry) => [...allergenAliases[allergen], allergenLabels?.[allergen] ?? ""].some((alias) => normalize(alias) === entry)),
  );
  const excluded = entries(preferences.excludedIngredients);
  const matchingIngredients = recipe.ingredients.filter((ingredient) =>
    excluded.some((entry) => normalize(ingredient.name) === entry),
  ).map((ingredient) => ingredient.name);
  const dietDeclared = preferences.diet !== "none" && recipe.dietTags !== undefined && (
    recipe.dietTags.includes(preferences.diet) ||
    (preferences.diet === "vegetarian" && recipe.dietTags.includes("vegan")) ||
    (preferences.diet === "pescatarian" && (recipe.dietTags.includes("vegan") || recipe.dietTags.includes("vegetarian")))
  );
  const dietConflict = preferences.diet !== "none" && recipe.dietTags !== undefined && !dietDeclared;
  return { matchingAllergens, matchingIngredients, dietDeclared, dietConflict };
}
