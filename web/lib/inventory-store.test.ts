import assert from "node:assert/strict";
import test from "node:test";

import type { Recipe } from "./demo-recipes.ts";
import type { DemoProduct } from "./demo-data.ts";
import {
  applyInventoryDeductions,
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
