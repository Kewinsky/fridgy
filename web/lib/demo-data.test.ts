import assert from "node:assert/strict";
import test from "node:test";

import { getFreshnessStatus } from "./demo-data.ts";

const today = new Date(2026, 9, 13, 12);

test("classifies freshness around every date boundary", () => {
  assert.equal(getFreshnessStatus("2026-10-12", today), "overdue");
  assert.equal(getFreshnessStatus("2026-10-13", today), "today");
  assert.equal(getFreshnessStatus("2026-10-16", today), "soon");
  assert.equal(getFreshnessStatus("2026-10-20", today), "week");
  assert.equal(getFreshnessStatus("2026-10-21", today), "calm");
});
