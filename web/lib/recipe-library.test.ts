import assert from "node:assert/strict";
import test from "node:test";

import {
  addCookingRecord,
  createCustomRecipe,
  emptyRecipeLibrary,
  getCookingCount,
  getFavoriteCuisine,
  removeCustomRecipe,
  replaceCustomRecipe,
  toggleFavorite,
} from "./recipe-library.ts";

test("records cooking events and derives useful statistics", () => {
  const once = addCookingRecord(
    emptyRecipeLibrary,
    { slug: "ramen", title: "Ramen", cuisine: "Japońska" },
    "1",
    "2026-10-13T10:00:00.000Z",
  );
  const twice = addCookingRecord(
    once,
    { slug: "ramen", title: "Ramen", cuisine: "Japońska" },
    "2",
    "2026-10-13T11:00:00.000Z",
  );

  assert.equal(getCookingCount(twice, "ramen"), 2);
  assert.equal(getFavoriteCuisine(twice), "Japońska");
});

test("toggles favorites without duplicates", () => {
  const added = toggleFavorite(emptyRecipeLibrary, "ramen");
  assert.deepEqual(added.favoriteSlugs, ["ramen"]);
  assert.deepEqual(toggleFavorite(added, "ramen").favoriteSlugs, []);
});

test("creates a recipe from line-based ingredients and steps", () => {
  const recipe = createCustomRecipe(
    {
      title: "  Tosty  ",
      description: "",
      cuisine: "Polska",
      time: 10,
      servings: 2,
      ingredients: "Chleb | 4 kromki\nSer | 100 g",
      steps: "Posmaruj chleb.\nPodpiecz.",
    },
    "tosty-1",
    "2026-10-13T10:00:00.000Z",
  );

  assert.equal(recipe.title, "Tosty");
  assert.equal(recipe.cuisine, "Polska");
  assert.deepEqual(recipe.ingredients[0], { name: "Chleb", amount: "4 kromki", available: true });
  assert.deepEqual(recipe.steps, ["Posmaruj chleb.", "Podpiecz."]);
});

test("updates and removes custom recipes without deleting cooking history", () => {
  const original = createCustomRecipe(
    {
      title: "Tosty",
      description: "",
      cuisine: "Polska",
      time: 10,
      servings: 2,
      ingredients: "Chleb | 4 kromki",
      steps: "Podpiecz.",
    },
    "tosty-1",
    "2026-10-13T10:00:00.000Z",
  );
  const library = addCookingRecord(
    { ...emptyRecipeLibrary, customRecipes: [original], favoriteSlugs: [original.slug] },
    original,
    "history-1",
    "2026-10-13T11:00:00.000Z",
  );
  const updated = { ...original, title: "Tosty z serem" };

  assert.equal(replaceCustomRecipe(library, updated).customRecipes[0].title, "Tosty z serem");

  const removed = removeCustomRecipe(library, original.slug);
  assert.deepEqual(removed.customRecipes, []);
  assert.deepEqual(removed.favoriteSlugs, []);
  assert.equal(removed.history.length, 1);
});
