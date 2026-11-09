import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";

import { prepareGeneratedRecipe } from "./generated-recipes.ts";
import { createCustomRecipe } from "./recipe-library.ts";
import { readStoredRecipes } from "./recipe-store.ts";

const output = {
  title: "Zupa",
  description: "Prosta zupa.",
  time: 25,
  difficulty: "Łatwy",
  cuisine: "Polska",
  servings: 2,
  calories: 120,
  macros: { protein: 3, carbs: 24, fat: 2 },
  ingredients: [{ name: "Marchew", quantity: 100, unit: "g" }],
  steps: ["Ugotuj marchew."],
  allergens: [],
};

test("validates AI output and never treats model allergen claims as verified", () => {
  const recipe = prepareGeneratedRecipe(
    output,
    "3798a119-c64c-4a90-8a3b-aa0dfb2d62ba",
  );
  assert.equal(recipe.allergens, undefined);
  assert.equal(recipe.calories, 120);
  assert.deepEqual(recipe.macros, { protein: 3, carbs: 24, fat: 2 });
  assert.equal(recipe.nutritionSource, "estimate");
  assert.equal(recipe.ingredients[0].amount, "100 g");
  assert.equal(prepareGeneratedRecipe({ ...output, ingredients: [{ name: "Marchew **— do kupienia**", quantity: 100, unit: "g" }] }, "3798a119-c64c-4a90-8a3b-aa0dfb2d62ba").ingredients[0].name, "Marchew");
  assert.throws(() =>
    prepareGeneratedRecipe(
      {
        ...output,
        ingredients: [{ name: "Marchew", quantity: -1, unit: "g" }],
      },
      "3798a119-c64c-4a90-8a3b-aa0dfb2d62ba",
    ),
  );
  assert.throws(() =>
    prepareGeneratedRecipe(
      { ...output, steps: ["x".repeat(1001)] },
      "3798a119-c64c-4a90-8a3b-aa0dfb2d62ba",
    ),
  );
  assert.throws(() => prepareGeneratedRecipe({ ...output, calories: 0 }, "3798a119-c64c-4a90-8a3b-aa0dfb2d62ba"));
  assert.throws(() => prepareGeneratedRecipe({ ...output, macros: { protein: -1, carbs: 24, fat: 2 } }, "3798a119-c64c-4a90-8a3b-aa0dfb2d62ba"));
});

test("reopens custom and AI recipes from the unified table", async () => {
  const stored = prepareGeneratedRecipe(output, "3798a119-c64c-4a90-8a3b-aa0dfb2d62ba");
  const oldAiRecipe = { ...stored, ingredients: stored.ingredients.map((ingredient) => ({ ...ingredient, name: "Marchew — do kupienia" })) };
  const custom = createCustomRecipe({
    title: "Kanapka", description: "Prosta", cuisine: "Polska", time: 5, servings: 1,
    ingredients: "Chleb | 2 szt.", steps: "Przygotuj kanapkę.",
  }, "kanapka-1", "2026-11-09T10:00:00.000Z");
  const client = {
    from(table: string) {
      assert.equal(table, "recipes");
      return {
        select(columns: string) {
          assert.equal(columns, "slug,source,recipe,created_at");
          return {
            eq(column: string, userId: string) {
              assert.equal(column, "user_id");
              return {
                async order() {
                  return {
                    data: userId === "user-1" ? [oldAiRecipe, custom].map((recipe) => ({
                      slug: recipe.slug, source: recipe.source, recipe, created_at: recipe.createdAt,
                    })) : [],
                    error: null,
                  };
                },
              };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;

  assert.deepEqual(await readStoredRecipes(client, "user-1"), [stored, custom]);
  assert.deepEqual(await readStoredRecipes(client, "user-2"), []);
});
