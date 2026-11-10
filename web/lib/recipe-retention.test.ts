import assert from "node:assert/strict";
import test from "node:test";

import { daysUntilRecipePruned } from "./recipe-retention.ts";

test("counts calendar days until the seven-day recipe deadline", () => {
  const now = new Date(2026, 10, 10, 12);
  const created = (day: number, hour = 13) => new Date(2026, 10, day, hour).toISOString();

  assert.equal(daysUntilRecipePruned(created(6), now), 3);
  assert.equal(daysUntilRecipePruned(created(5), now), 2);
  assert.equal(daysUntilRecipePruned(created(4), now), 1);
  assert.equal(daysUntilRecipePruned(created(3), now), 0);
  assert.equal(daysUntilRecipePruned(created(3, 11), now), null);
  assert.equal(daysUntilRecipePruned(created(7), now), null);
  assert.equal(daysUntilRecipePruned("invalid", now), null);
});
