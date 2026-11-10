import assert from "node:assert/strict";
import test from "node:test";

import { getFreshnessStatus, isPrioritizableProduct, type DemoProduct } from "./demo-data.ts";

const today = new Date(2026, 9, 13, 12);

test("classifies freshness around every date boundary", () => {
  assert.equal(getFreshnessStatus("2026-10-12", today), "overdue");
  assert.equal(getFreshnessStatus("2026-10-13", today), "today");
  assert.equal(getFreshnessStatus("2026-10-16", today), "soon");
  assert.equal(getFreshnessStatus("2026-10-20", today), "week");
  assert.equal(getFreshnessStatus("2026-10-21", today), "calm");
});

test("offers only available products that are not past their estimated date", () => {
  const product: DemoProduct = {
    id: "1", name: "Marchew", quantity: 2, unit: "szt.", category: "Warzywa",
    storageLocation: "Lodówka", estimatedUseBy: "2026-10-13", status: "active",
  };
  assert.equal(isPrioritizableProduct(product, today), true);
  assert.equal(isPrioritizableProduct({ ...product, estimatedUseBy: "2026-10-12" }, today), false);
  assert.equal(isPrioritizableProduct({ ...product, quantity: 0 }, today), false);
  assert.equal(isPrioritizableProduct({ ...product, status: "consumed" }, today), false);
});
