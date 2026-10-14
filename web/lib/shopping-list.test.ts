import assert from "node:assert/strict";
import test from "node:test";

import {
  mergeShoppingItems,
  formatShoppingList,
} from "./shopping-list.ts";

test("formats only products that still need to be bought", () => {
  assert.equal(
    formatShoppingList([
      { name: "Banany", done: false },
      { name: "Kawa", done: true },
    ]),
    "Lista zakupów – Fridgy\n\n- Banany",
  );
  assert.equal(
    formatShoppingList([
      { name: "Banany", done: false },
      { name: "Kawa", done: true },
    ], false),
    "- Banany",
  );
});

test("adds new products and restores completed products", () => {
  const result = mergeShoppingItems([
    { id: "1", name: "Banany", done: false },
    { id: "2", name: "Kawa ziarnista", done: false },
    { id: "3", name: "Woda gazowana", done: true },
  ], ["Cytryna", "cytryna", "Banany", "Woda gazowana"]);
  assert.equal(result.changedCount, 2);
  assert.deepEqual(
    result.items.map(({ name, done }) => ({ name, done })),
    [
      { name: "Banany", done: false },
      { name: "Kawa ziarnista", done: false },
      { name: "Woda gazowana", done: false },
      { name: "Cytryna", done: false },
    ],
  );
});
