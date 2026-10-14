import assert from "node:assert/strict";
import test from "node:test";

import { safeAuthPath } from "./auth-next.ts";

test("keeps only invitation paths as post-login destinations", () => {
  const invite = "/invite/550e8400-e29b-41d4-a716-446655440000";
  assert.equal(safeAuthPath(invite), invite);
  for (const path of [undefined, "//evil.test", "/\\evil.test", "https://evil.test", "/dashboard/../../admin"]) {
    assert.equal(safeAuthPath(path), "/dashboard");
  }
});
