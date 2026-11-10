import assert from "node:assert/strict";
import test from "node:test";

import { shouldRelocateRecipeImage } from "./account-deletion.ts";

test("keeps images used by surviving households when an account is deleted", () => {
  const deletedHouseholds = new Set(["solo"]);
  assert.equal(shouldRelocateRecipeImage({ household_id: "shared", user_id: "author", recipe: { imageOwnerId: "deleted" } }, "deleted", deletedHouseholds), true);
  assert.equal(shouldRelocateRecipeImage({ household_id: "shared", user_id: "deleted", recipe: {} }, "deleted", deletedHouseholds), true);
  assert.equal(shouldRelocateRecipeImage({ household_id: "solo", user_id: "deleted", recipe: {} }, "deleted", deletedHouseholds), false);
  assert.equal(shouldRelocateRecipeImage({ household_id: "shared", user_id: "author", recipe: { imageOwnerId: "author" } }, "deleted", deletedHouseholds), false);
});
