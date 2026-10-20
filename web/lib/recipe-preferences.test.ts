import assert from "node:assert/strict";
import test from "node:test";

import { demoRecipes } from "./demo-recipes.ts";
import { getRecipePreferenceConflicts } from "./recipe-preferences.ts";

test("flags explicit allergen, diet and ingredient conflicts", () => {
  const recipe = demoRecipes.find((item) => item.slug === "makaron-ze-szpinakiem")!;
  const result = getRecipePreferenceConflicts(recipe, {
    diet: "vegan", allergies: "mleko, jaja", excludedIngredients: "Szpinak baby",
  });
  assert.equal(result.dietConflict, true);
  assert.deepEqual(result.matchingAllergens, ["milk"]);
  assert.deepEqual(result.matchingIngredients, ["Szpinak baby"]);
});

test("does not claim a conflict when recipe allergen data is unknown", () => {
  const recipe = { ...demoRecipes[0], allergens: undefined, dietTags: undefined };
  const result = getRecipePreferenceConflicts(recipe, {
    diet: "vegan", allergies: "mleko", excludedIngredients: "",
  });
  assert.deepEqual(result.matchingAllergens, []);
  assert.equal(result.dietConflict, false);
});

test("does not flag a milk allergy for chicken without listed allergens", () => {
  const recipe = demoRecipes.find((item) => item.slug === "kurczak-z-warzywami")!;
  assert.deepEqual(recipe.allergens, []);
  const result = getRecipePreferenceConflicts(recipe, {
    diet: "none", allergies: "mleko", excludedIngredients: "",
  });
  assert.deepEqual(result.matchingAllergens, []);
});

test("vegetarian recipes satisfy a pescatarian preference", () => {
  const result = getRecipePreferenceConflicts(demoRecipes[0], {
    diet: "pescatarian", allergies: "", excludedIngredients: "",
  });
  assert.equal(result.dietDeclared, true);
  assert.equal(result.dietConflict, false);
});

test("matches a translated allergen label supplied by the UI", () => {
  const result = getRecipePreferenceConflicts(demoRecipes[0], {
    diet: "none", allergies: "Milch", excludedIngredients: "",
  }, { milk: "Milch" });
  assert.deepEqual(result.matchingAllergens, ["milk"]);
});
