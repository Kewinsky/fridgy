import assert from "node:assert/strict";
import test from "node:test";

import { demoProducts, type DemoProduct } from "./demo-data.ts";
import { sortInventoryProducts } from "./inventory-sort.ts";

const sample: DemoProduct = {
  id: "1", name: "Jabłka", quantity: 1, unit: "szt.", category: "Owoce",
  storageLocation: "Lodówka", estimatedUseBy: "2027-02-01", status: "active",
};
const products = [
  sample,
  { ...sample, id: "2", name: "Banany", estimatedUseBy: "2027-01-01" },
  { ...sample, id: "3", name: "Śliwki", estimatedUseBy: "2027-01-01" },
];

test("sorts inventory before pagination without mutating its original order", () => {
  assert.deepEqual(sortInventoryProducts(products, "default", "pl").map((item) => item.id), ["1", "2", "3"]);
  assert.deepEqual(sortInventoryProducts(products, "nameAsc", "pl").map((item) => item.id), ["2", "1", "3"]);
  assert.deepEqual(sortInventoryProducts(products, "nameDesc", "pl").map((item) => item.id), ["3", "1", "2"]);
  assert.deepEqual(sortInventoryProducts(products, "expiryAsc", "pl").map((item) => item.id), ["2", "3", "1"]);
  assert.deepEqual(sortInventoryProducts(products, "expiryDesc", "pl").map((item) => item.id), ["1", "2", "3"]);
  assert.deepEqual(products.map((item) => item.id), ["1", "2", "3"]);
});

test("sorts demo products by the name shown in the selected language", () => {
  assert.deepEqual(sortInventoryProducts(demoProducts.slice(0, 2), "nameAsc", "en").map((item) => item.id), ["p1", "p0"]);
});
