import { recipeAllergens, type Recipe, type RecipeAllergen } from "./demo-recipes.ts";

type Preferences = {
  diet: "none" | "vegetarian" | "vegan" | "pescatarian";
  allergies: string;
  excludedIngredients: string;
};

const allergenAliases: Record<RecipeAllergen, string[]> = {
  gluten: ["gluten", "pszenica", "zyto", "jęczmień", "jéczmien", "wheat", "rye", "barley", "owies", "oats", "mąka", "flour", "makaron", "pasta", "chleb", "bread"],
  crustaceans: ["skorupiaki", "crustaceans"],
  eggs: ["jaja", "jajka", "jajko", "egg", "eggs", "majonez", "mayonnaise"],
  fish: ["ryby", "ryba", "fish"],
  peanuts: ["orzeszki ziemne", "orzechy ziemne", "peanuts", "peanut"],
  soy: ["soja", "soy", "tofu"],
  milk: ["mleko", "nabiał", "nabial", "milk", "dairy", "jogurt", "yogurt", "śmietana", "cream", "masło", "butter", "ser", "cheese", "mozzarella", "parmezan"],
  nuts: ["orzechy", "nuts", "tree nuts", "nüsse", "noix", "frutos secos", "migdały", "almonds", "pistacje", "pistachios", "nerkowce", "cashews"],
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

export function parseSelectedAllergens(value: string): RecipeAllergen[] {
  const selected = entries(value);
  return recipeAllergens.filter((allergen) => selected.some((item) =>
    [allergen, ...allergenAliases[allergen]].some((alias) => normalize(alias) === item),
  ));
}

export function getKnownAllergenConflicts(recipe: Pick<Recipe, "allergens" | "ingredients">, allergies: string): RecipeAllergen[] {
  return parseSelectedAllergens(allergies).filter((allergen) =>
    recipe.allergens?.includes(allergen) || recipe.ingredients.some((ingredient) =>
      allergenAliases[allergen].some((alias) => normalize(ingredient.name).includes(normalize(alias))),
    ),
  );
}

export function getRecipePreferenceConflicts(recipe: Recipe, preferences: Preferences, allergenLabels?: Partial<Record<RecipeAllergen, string>>) {
  const requestedAllergens = entries(preferences.allergies);
  const matchingAllergens = recipeAllergens.filter((allergen) =>
    requestedAllergens.some((entry) => [...allergenAliases[allergen], allergen, allergenLabels?.[allergen] ?? ""].some((alias) => normalize(alias) === entry)) &&
    (recipe.allergens?.includes(allergen) || recipe.ingredients.some((ingredient) =>
      allergenAliases[allergen].some((alias) => normalize(ingredient.name).includes(normalize(alias))),
    )),
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
