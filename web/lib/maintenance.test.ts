import assert from "node:assert/strict";
import test from "node:test";

import { maintenanceAction } from "./maintenance.ts";

test("maintenance keeps status pages available without Supabase", () => {
  assert.equal(maintenanceAction("/maintenance", "GET", true), "bypass");
  assert.equal(maintenanceAction("/offline", "GET", false), "bypass");
});

test("maintenance redirects pages and rejects API calls and writes", () => {
  assert.equal(maintenanceAction("/dashboard", "GET", true), "redirect");
  assert.equal(maintenanceAction("/api/receipts/analyze", "POST", true), "unavailable");
  assert.equal(maintenanceAction("/dashboard/ustawienia", "POST", true), "unavailable");
  assert.equal(maintenanceAction("/dashboard", "GET", false), "continue");
});
