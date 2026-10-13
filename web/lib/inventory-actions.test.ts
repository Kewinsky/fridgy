import assert from "node:assert/strict";
import test from "node:test";

import { demoProducts } from "./demo-data.ts";
import { applyInventoryAction } from "./inventory-actions.ts";

test("applies inventory actions only to selected products", () => {
  const selected = new Set([demoProducts[0].id]);
  const consumed = applyInventoryAction(demoProducts, selected, { type: "consume" }, "2026-11-27");
  const frozen = applyInventoryAction(demoProducts, selected, { type: "move", location: "Zamrażarka" }, "2026-11-27");
  const refrigerated = applyInventoryAction(demoProducts, selected, { type: "move", location: "Lodówka" }, "2026-11-27");
  const removed = applyInventoryAction(demoProducts, selected, { type: "remove" }, "2026-11-27");

  assert.equal(consumed[0].status, "consumed");
  assert.equal(consumed[1].status, "active");
  assert.equal(frozen[0].storageLocation, "Zamrażarka");
  assert.equal(frozen[0].estimatedUseBy, "2026-11-27");
  assert.equal(refrigerated[0].storageLocation, "Lodówka");
  assert.equal(removed.some((product) => product.id === demoProducts[0].id), false);
});
