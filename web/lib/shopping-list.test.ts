import assert from "node:assert/strict";
import test from "node:test";

import {
  addShoppingItems,
  formatShoppingList,
  readShoppingList,
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
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };

  assert.equal(
    addShoppingItems(storage, ["Cytryna", "cytryna", "Banany", "Woda gazowana"]),
    2,
  );
  assert.deepEqual(
    readShoppingList(storage).map(({ name, done }) => ({ name, done })),
    [
      { name: "Banany", done: false },
      { name: "Kawa ziarnista", done: false },
      { name: "Woda gazowana", done: false },
      { name: "Cytryna", done: false },
    ],
  );
});
