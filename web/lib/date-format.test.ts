import assert from "node:assert/strict";
import test from "node:test";

import { dateFormats, formatUserDate } from "./date-format.ts";

test("formats stored calendar dates without shifting their day", () => {
  const date = "2026-11-09";
  assert.deepEqual(dateFormats.map((format) => formatUserDate(date, format)), [
    "09.11.2026", "09/11/2026", "2026-11-09",
  ]);
});

test("formats cooking timestamps using the local calendar day", () => {
  assert.equal(formatUserDate(new Date(2026, 0, 2, 12), "DD/MM/YYYY"), "02/01/2026");
});
