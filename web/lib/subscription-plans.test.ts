import assert from "node:assert/strict";
import test from "node:test";
import { formatPlanPrice } from "./subscription-plans.ts";

test("formats stored grosz as Polish subscription prices", () => {
  assert.match(formatPlanPrice(1999, "PLN", "pl"), /19,99\s*zł/);
  assert.match(formatPlanPrice(14999, "PLN", "pl"), /149,99\s*zł/);
});
