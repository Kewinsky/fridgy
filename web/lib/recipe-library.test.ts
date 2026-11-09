import assert from "node:assert/strict";
import test from "node:test";

import {
  addCookingRecord,
  createCustomRecipe,
  emptyRecipeLibrary,
  getCookingCount,
  getFavoriteCuisine,
  getHistoryRecipes,
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

test("history includes generated recipes and cooked custom recipes, but not unsaved activity", () => {
  const custom = createCustomRecipe({
    title: "Tosty", description: "", cuisine: "Polska", time: 10, servings: 1,
    ingredients: "Chleb | 1 szt.", steps: "Podpiecz.",
  }, "custom-1", "2026-10-13T10:00:00.000Z");
  const generated = { ...custom, slug: "ai-1", source: "ai" as const, createdAt: "2026-10-14T10:00:00.000Z" };
  const untouched = { ...custom, slug: "custom-2" };
  const history = addCookingRecord(emptyRecipeLibrary, custom, "1", "2026-10-15T10:00:00.000Z").history;

  assert.deepEqual(getHistoryRecipes([custom, generated, untouched], [], history).map((recipe) => recipe.slug), ["custom-1", "ai-1"]);
  assert.deepEqual(getHistoryRecipes([custom, generated, untouched], [], []).map((recipe) => recipe.slug), ["ai-1"]);
});

test("parses line-based ingredients into structured quantities", () => {
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
  assert.deepEqual(recipe.ingredients[0], { name: "Chleb", quantity: 4, unit: "kromki", amount: "4 kromki", available: true });
  assert.deepEqual(recipe.steps, ["Posmaruj chleb.", "Podpiecz."]);
  assert.equal(recipe.calories, undefined);
});

test("custom recipes keep their source and cooking history", () => {
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
    { ...emptyRecipeLibrary, favoriteSlugs: [original.slug] },
    original,
    "history-1",
    "2026-10-13T11:00:00.000Z",
  );
  assert.equal(original.source, "custom");
  assert.equal(library.history[0].recipeSlug, original.slug);
});

test("keeps an old unquantified ingredient when editing a recipe", () => {
  const recipe = createCustomRecipe({
    title: "Soup", description: "", cuisine: "Domowa", time: 20, servings: 2,
    ingredients: "Salt | szczypta",
    steps: "Season.",
  }, "soup", "2026-10-13T10:00:00.000Z");
  assert.equal(recipe.ingredients[0].amount, "szczypta");
  assert.equal(recipe.ingredients[0].quantity, undefined);
});

test("stores manually entered nutrition, allergens and active time", () => {
  const recipe = createCustomRecipe({
    title: "Egg toast", description: "", cuisine: "Domowa", time: 15, activeTime: 8, servings: 1,
    ingredients: "Eggs | 2 pcs", steps: "Cook.",
    nutrition: { calories: 300, protein: 18, carbs: 20, fat: 16 }, allergens: ["eggs"], dietTags: ["vegetarian"],
  }, "egg-toast", "2026-10-13T10:00:00.000Z");
  assert.equal(recipe.activeTime, 8);
  assert.equal(recipe.nutritionSource, "author");
  assert.equal(recipe.macros?.protein, 18);
  assert.deepEqual(recipe.allergens, ["eggs"]);
  assert.deepEqual(recipe.dietTags, ["vegetarian"]);
});
