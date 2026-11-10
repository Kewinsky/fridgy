import assert from "node:assert/strict";
import test from "node:test";

import { acceptedGeneratedRecipes, collectGeneratedRecipes, generationContext, generationInputSchema, requestDailyRecipe, requestModelRecipes } from "./recipe-generation.ts";
import type { DemoProduct } from "./demo-data.ts";

const input = generationInputSchema.parse({
  meal: "lunch", servings: 2, time: "30", shopping: "none", cuisines: [],
  savedRecipes: "newOnly", notes: "Bez ostrych przypraw", locale: "pl", excludeTitles: [],
});
const products: DemoProduct[] = [{
  id: "1", name: "Marchew", quantity: 0.5, unit: "kg", category: "Warzywa",
  storageLocation: "Lodówka", estimatedUseBy: "2026-11-20", status: "active",
}];
const recipe = {
  title: "Zupa z marchwi", description: "Prosta zupa", time: 20, difficulty: "Łatwy",
  cuisine: "Polska", servings: 2, calories: 120, macros: { protein: 3, carbs: 24, fat: 2 },
  ingredients: [{ name: "Marchew", quantity: 300, unit: "g" }],
  steps: ["Ugotuj marchew."], allergens: [],
};
const modelOutput = (recipes: unknown[], message = "Mam kilka pomysłów na obiad.") => ({ message, recipes });

test("accepts soup as a meal and asks for one daily recipe in one model call", async () => {
  const soupInput = generationInputSchema.parse({ ...input, meal: "soup" });
  let calls = 0;
  const daily = await requestDailyRecipe("key", soupInput, products, { diet: "none", allergies: "", excludedIngredients: "" }, [], async (_key, context) => {
    calls += 1;
    assert.equal(context.meal, "soup");
    assert.equal(context.targetRecipeCount, 1);
    return modelOutput([recipe]);
  });
  assert.equal(calls, 1);
  assert.equal(daily?.title, "Zupa z marchwi");
});

test("daily idea rejects an allergen conflict without another model call", async () => {
  let calls = 0;
  const daily = await requestDailyRecipe("key", input, products, { diet: "none", allergies: "milk", excludedIngredients: "" }, [], async () => {
    calls += 1;
    return modelOutput([{ ...recipe, allergens: ["milk"] }]);
  });
  assert.equal(calls, 1);
  assert.equal(daily, null);
});

test("sends form answers and current stock to the model context", () => {
  const context = generationContext(input, products, { diet: "vegan", allergies: "milk,eggs", excludedIngredients: "mleko" }, []);
  assert.equal(context.meal, "lunch");
  assert.equal(context.servings, 2);
  assert.equal(context.maxMinutes, 30);
  assert.equal(context.notes, "Bez ostrych przypraw");
  assert.deepEqual(context.inventory, [{ name: "Marchew", quantity: 0.5, unit: "kg" }]);
  assert.equal(context.diet, "vegan");
  assert.equal(context.allergies, "milk,eggs");
  assert.deepEqual(context.priorityProducts, []);
});

test("sends selected stock as a soft priority even when it follows the first 100 products", () => {
  const selectedId = "3798a119-c64c-4a90-8a3b-aa0dfb2d62ba";
  const selected = { ...products[0], id: selectedId, name: "Brokuły", estimatedUseBy: "2099-01-01" };
  const stock = [...Array.from({ length: 100 }, (_, index) => ({ ...products[0], id: String(index), name: `Produkt ${index}` })), selected];
  const chosen = generationInputSchema.parse({ ...input, priorityProductIds: [selectedId] });
  const context = generationContext(chosen, stock, { diet: "none", allergies: "", excludedIngredients: "" }, []);
  assert.equal(context.inventory[0].name, "Brokuły");
  assert.deepEqual(context.priorityProducts, [{ name: "Brokuły", quantity: 0.5, unit: "kg", estimatedUseBy: "2099-01-01" }]);
  assert.equal(generationInputSchema.safeParse({ ...input, priorityProductIds: [selectedId, selectedId] }).success, false);
});

test("rejects suggestions that exceed time, shopping or excluded ingredient limits", () => {
  assert.deepEqual(acceptedGeneratedRecipes(modelOutput([recipe]), input, products, "", "milk"), [recipe]);
  assert.deepEqual(acceptedGeneratedRecipes(modelOutput([{ ...recipe, time: 35 }]), input, products, "", ""), []);
  assert.deepEqual(acceptedGeneratedRecipes(modelOutput([{ ...recipe, ingredients: [{ name: "Ryż", quantity: 100, unit: "g" }] }]), input, products, "", ""), []);
  assert.deepEqual(acceptedGeneratedRecipes(modelOutput([recipe]), input, products, "marchew", ""), []);
});

test("filters declared and ingredient allergen conflicts without blocking other recipes", () => {
  const noShoppingLimit = { ...input, shopping: "any" as const };
  const milk = { ...recipe, title: "Mleczna zupa", allergens: ["milk"] };
  const cheese = { ...recipe, title: "Zupa z serem", ingredients: [{ name: "Ser", quantity: 100, unit: "g" }], allergens: [] };
  assert.deepEqual(acceptedGeneratedRecipes(modelOutput([milk, cheese, recipe]), noShoppingLimit, products, "", "milk"), [recipe]);
});

test("checks ingredient totals for the requested serving count", () => {
  const fourServings = { ...input, servings: 4 };
  const fourPortions = { ...recipe, servings: 4, ingredients: [{ name: "Marchew", quantity: 600, unit: "g" }] };
  assert.deepEqual(acceptedGeneratedRecipes(modelOutput([fourPortions]), fourServings, products, "", ""), []);
  assert.deepEqual(acceptedGeneratedRecipes(modelOutput([fourPortions]), { ...fourServings, shopping: "any" }, products, "", ""), [fourPortions]);
});

test("removes model shopping labels before checking stock", () => {
  const labeled = { ...recipe, ingredients: [{ name: "Marchew — do kupienia", quantity: 300, unit: "g" }] };
  assert.deepEqual(acceptedGeneratedRecipes(modelOutput([labeled]), input, products, "", ""), [recipe]);
});

test("treats tap water as available and removes it from generated ingredients", () => {
  const withWater = { ...recipe, ingredients: [...recipe.ingredients, { name: "Woda", quantity: 600, unit: "ml" }] };
  assert.deepEqual(acceptedGeneratedRecipes(modelOutput([withWater]), input, products, "", ""), [recipe]);
  assert.deepEqual(acceptedGeneratedRecipes(modelOutput([{ ...recipe, ingredients: [{ name: "Woda", quantity: 600, unit: "ml" }] }]), input, products, "", ""), []);
  const coconutWater = { ...recipe, ingredients: [{ name: "Woda kokosowa", quantity: 600, unit: "ml" }] };
  assert.deepEqual(acceptedGeneratedRecipes(modelOutput([coconutWater]), { ...input, shopping: "any" }, products, "", ""), [coconutWater]);
});

test("fills a batch with three distinct recipes and asks only for the missing count", async () => {
  const contexts: Array<ReturnType<typeof generationContext>> = [];
  const request = async (_key: string, context: ReturnType<typeof generationContext>) => {
    contexts.push(context);
    if (contexts.length === 1) return modelOutput([{ ...recipe, title: "A" }, { ...recipe, title: "B" }], "Pierwsza wiadomość.");
    return modelOutput([{ ...recipe, title: "A" }, { ...recipe, title: "C" }], "Druga wiadomość.");
  };
  const result = await collectGeneratedRecipes("key", input, products, { diet: "none", allergies: "", excludedIngredients: "" }, [], request);
  assert.deepEqual(result.recipes.map((item) => item.title), ["A", "B", "C"]);
  assert.equal(result.message, "Pierwsza wiadomość.");
  assert.deepEqual(contexts.map((context) => context.targetRecipeCount), [3, 1]);
  assert.deepEqual(contexts[1].avoidTitles, ["A", "B"]);
});

test("stops after three attempts when no-shopping constraints yield fewer recipes", async () => {
  let calls = 0;
  const result = await collectGeneratedRecipes("key", input, products, { diet: "none", allergies: "", excludedIngredients: "" }, [], async () => {
    calls += 1;
    return calls === 1 ? modelOutput([recipe]) : modelOutput([]);
  });
  assert.equal(calls, 3);
  assert.deepEqual(result.recipes, [recipe]);
});

test("requests structured recipes and reads the model response", async () => {
  const context = generationContext(input, products, { diet: "none", allergies: "milk", excludedIngredients: "" }, []);
  const fakeFetch = (async (_url: string, options: RequestInit) => {
    const body = JSON.parse(String(options.body));
    assert.equal(body.input, JSON.stringify(context));
    assert.equal(body.text.format.type, "json_schema");
    assert.deepEqual(body.text.format.schema.properties.recipes.items.properties.macros.required, ["protein", "carbs", "fat"]);
    assert.match(body.instructions, /totals for all requested servings/);
    assert.match(body.instructions, /per serving/);
    assert.match(body.instructions, /inventory is a set of available options/);
    assert.match(body.instructions, /Priority products are a soft preference/);
    assert.match(body.instructions, /Start from a known dish/);
    assert.match(body.instructions, /Tap water is always available/);
    assert.equal(body.store, false);
    return { ok: true, json: async () => ({ status: "completed", output: [{ content: [{ type: "output_text", text: JSON.stringify(modelOutput([recipe])) }] }] }) } as Response;
  }) as typeof fetch;
  assert.deepEqual(await requestModelRecipes("test-key", context, fakeFetch), modelOutput([recipe]));
});
