import assert from "node:assert/strict";
import test from "node:test";

import { demoRecipes, filterRecipesByCuisines } from "./demo-recipes.ts";

test("cuisine choices include any selected cuisine and an empty choice leaves recipes unchanged", () => {
  assert.deepEqual(filterRecipesByCuisines(demoRecipes, []), demoRecipes);
  assert.deepEqual(filterRecipesByCuisines(demoRecipes, ["Włoska", "Polska"]), demoRecipes.filter((recipe) => ["Włoska", "Polska"].includes(recipe.cuisine)));
  assert.deepEqual(filterRecipesByCuisines(demoRecipes, ["Azjatycka"]), []);
});

test("demo nutrition is estimated per serving and consistent with calories", () => {
  for (const recipe of demoRecipes) {
    assert.ok(recipe.macros);
    assert.ok(recipe.calories);
    const energy = recipe.macros.protein * 4 + recipe.macros.carbs * 4 + recipe.macros.fat * 9;
    assert.ok(Math.abs(energy - recipe.calories) < 10, recipe.slug);
  }
});
