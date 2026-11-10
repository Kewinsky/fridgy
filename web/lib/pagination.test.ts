import assert from "node:assert/strict";
import test from "node:test";

import { paginate } from "./pagination.ts";

test("shows the requested slice and clamps a page after products are removed", () => {
  const products = Array.from({ length: 23 }, (_, index) => index + 1);
  assert.deepEqual(paginate(products, 2, 10), {
    items: products.slice(10, 20), page: 2, pageCount: 3, start: 11, end: 20,
  });
  assert.deepEqual(paginate(products.slice(0, 12), 3, 10), {
    items: [11, 12], page: 2, pageCount: 2, start: 11, end: 12,
  });
});

test("handles empty lists and different page sizes", () => {
  assert.deepEqual(paginate([], 4, 20), { items: [], page: 1, pageCount: 1, start: 0, end: 0 });
  assert.deepEqual(paginate(Array.from({ length: 23 }, (_, index) => index), 2, 20), {
    items: [20, 21, 22], page: 2, pageCount: 2, start: 21, end: 23,
  });
});
