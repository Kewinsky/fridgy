import assert from "node:assert/strict";
import test from "node:test";

import type { Recipe } from "./demo-recipes.ts";
import type { DemoProduct } from "./demo-data.ts";
import {
  applyInventoryDeductions,
  hasEnoughIngredient,
  matchRecipeToInventory,
  suggestRecipeDeductions,
} from "./inventory-store.ts";

const products: DemoProduct[] = [
  {
    id: "p1",
    name: "Makaron",
    quantity: 500,
    unit: "g",
    category: "Sypkie",
    storageLocation: "Spiżarnia",
    estimatedUseBy: "2027-01-01",
    status: "active",
  },
  {
    id: "p2",
    name: "Pomidory",
    quantity: 600,
    unit: "g",
    category: "Warzywa",
    storageLocation: "Lodówka",
    estimatedUseBy: "2026-10-20",
    status: "active",
  },
];

const recipe = {
  ingredients: [
    { name: "Makaron", amount: "200 g", available: true },
    { name: "Pomidory", amount: "2 szt.", available: true },
  ],
} satisfies Pick<Recipe, "ingredients">;

test("suggests only deductions with compatible units", () => {
  assert.deepEqual(suggestRecipeDeductions(recipe, products), [
    {
      productId: "p1",
      ingredientAmount: "200 g",
      amount: 200,
      selected: true,
    },
    {
      productId: "p2",
      ingredientAmount: "2 szt.",
      amount: 0,
      selected: false,
    },
  ]);
});

test("tap water is available without stock and is never deducted", () => {
  const water = { name: "Woda", amount: "600 ml", available: false };
  assert.equal(hasEnoughIngredient(water, []), true);
  assert.deepEqual(suggestRecipeDeductions({ ingredients: [water] }, [{ ...products[0], name: "Woda", quantity: 1000, unit: "ml" }]), []);
});

test("uses structured ingredient quantity before the legacy display amount", () => {
  const structured = { ingredients: [{ name: "Makaron", quantity: 125, unit: "g", amount: "old value", available: true }] } satisfies Pick<Recipe, "ingredients">;
  assert.deepEqual(suggestRecipeDeductions(structured, products)[0], {
    productId: "p1", ingredientAmount: "old value", amount: 125, selected: true,
  });
});

test("deducts 300 g of rice as 0.3 kg from a kilogram stock item", () => {
  const rice = { ...products[0], id: "rice", name: "Ryż", quantity: 1, unit: "kg" };
  const deductions = suggestRecipeDeductions({ ingredients: [{ name: "Ryż", amount: "300 g", available: true }] }, [rice]);
  assert.deepEqual(deductions, [{ productId: "rice", ingredientAmount: "300 g", amount: 0.3, selected: true }]);
  assert.equal(applyInventoryDeductions([rice], deductions)[0].quantity, 0.7);
});

test("converts kilograms to grams and milliliters to liters", () => {
  const rice = { ...products[0], id: "rice", name: "Ryż", quantity: 1500, unit: "g" };
  const milk = { ...products[0], id: "milk", name: "Mleko", quantity: 1, unit: "l" };
  const deductions = suggestRecipeDeductions({ ingredients: [
    { name: "Ryż", amount: "1 kg", available: true },
    { name: "Mleko", amount: "250 ml", available: true },
  ] }, [rice, milk]);
  assert.deepEqual(deductions.map(({ productId, amount }) => ({ productId, amount })), [
    { productId: "rice", amount: 1000 }, { productId: "milk", amount: 0.25 },
  ]);
});

test("splits a recipe amount across stock packages without double counting", () => {
  const rice = [
    { ...products[0], id: "rice-1", name: "Ryż", quantity: 0.5, unit: "kg" },
    { ...products[0], id: "rice-2", name: "Ryż", quantity: 500, unit: "g" },
  ];
  const deductions = suggestRecipeDeductions({ ingredients: [
    { name: "Ryż", amount: "600 g", available: true },
    { name: "Ryż", amount: "200 g", available: true },
  ] }, rice);
  assert.deepEqual(deductions.map(({ productId, amount }) => ({ productId, amount })), [
    { productId: "rice-1", amount: 0.5 }, { productId: "rice-2", amount: 300 },
  ]);
  assert.deepEqual(applyInventoryDeductions(rice, deductions).map((product) => product.quantity), [0, 200]);
});

test("reduces stock and marks an empty product as consumed", () => {
  const result = applyInventoryDeductions(products, [
    { productId: "p1", amount: 200 },
    { productId: "p2", amount: 600 },
  ]);

  assert.equal(result[0].quantity, 300);
  assert.equal(result[0].status, "active");
  assert.equal(result[1].quantity, 0);
  assert.equal(result[1].status, "consumed");
});

test("recipe availability checks stock quantities and compatible units", () => {
  const currentRecipe: Recipe = {
    slug: "pasta", title: "Pasta", description: "", time: 20, difficulty: "Łatwy",
    calories: 0, cuisine: "Włoska", servings: 2, steps: [],
    ingredients: [
      { name: "Makaron penne", amount: "200 g", available: false },
      { name: "Pomidory malinowe", amount: "2 szt.", available: false },
      { name: "Ser", amount: "50 g", available: true },
    ],
  };
  const matched = matchRecipeToInventory(currentRecipe, products);
  assert.deepEqual(matched.ingredients.map((item) => item.available), [true, false, false]);
  assert.deepEqual(currentRecipe.ingredients.map((item) => item.available), [false, false, true]);
});
