import assert from "node:assert/strict";
import test from "node:test";

import { matchesInventoryFilters } from "./inventory-filters.ts";
import type { DemoProduct } from "./demo-data.ts";

const product: DemoProduct = {
  id: "product", name: "Herbata", quantity: 1, unit: "opak.", category: "Napoje",
  storageLocation: "Spiżarnia", estimatedUseBy: "2099-01-01", status: "active",
};

test("matches any selected value within a filter and every active filter group", () => {
  assert.equal(matchesInventoryFilters(product, ["Lodówka", "Spiżarnia"], ["Owoce", "Napoje"], ["calm", "soon"]), true);
  assert.equal(matchesInventoryFilters(product, ["Lodówka"], ["Napoje"], []), false);
  assert.equal(matchesInventoryFilters(product, ["Spiżarnia"], ["Owoce"], []), false);
  assert.equal(matchesInventoryFilters(product, [], [], ["today", "soon"]), false);
});

test("empty selections show active products only", () => {
  assert.equal(matchesInventoryFilters(product, [], [], []), true);
  assert.equal(matchesInventoryFilters({ ...product, status: "consumed" }, [], [], []), false);
});
