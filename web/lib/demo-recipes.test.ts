import assert from "node:assert/strict";
import test from "node:test";

import { demoRecipes, filterRecipesByCuisine } from "./demo-recipes.ts";

test("cuisine choice filters demo recipes without changing the any choice", () => {
  assert.deepEqual(filterRecipesByCuisine(demoRecipes, "any"), demoRecipes);
  assert.ok(filterRecipesByCuisine(demoRecipes, "Włoska").every((recipe) => recipe.cuisine === "Włoska"));
  assert.deepEqual(filterRecipesByCuisine(demoRecipes, "Azjatycka"), []);
});

test("demo nutrition is estimated per serving and consistent with calories", () => {
  for (const recipe of demoRecipes) {
    assert.ok(recipe.macros);
    assert.ok(recipe.calories);
    const energy = recipe.macros.protein * 4 + recipe.macros.carbs * 4 + recipe.macros.fat * 9;
    assert.ok(Math.abs(energy - recipe.calories) < 10, recipe.slug);
  }
});
