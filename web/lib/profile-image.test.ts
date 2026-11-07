import assert from "node:assert/strict";
import test from "node:test";

import { getProfileImageSrc, MAX_PROFILE_IMAGE_MB, validateProfileImage } from "./profile-image.ts";

test("profile images stop at 2 MB and use the private image route", async () => {
  const valid = new File([new Uint8Array([255, 216, 255, 0])], "avatar.jpg", { type: "image/jpeg" });
  const oversized = new File([new Uint8Array(MAX_PROFILE_IMAGE_MB * 1024 * 1024 + 1)], "avatar.jpg", { type: "image/jpeg" });
  const filename = "12345678-1234-1234-1234-123456789abc.jpg";

  assert.equal(await validateProfileImage(valid), null);
  assert.equal(await validateProfileImage(oversized), "tooLarge");
  assert.equal(getProfileImageSrc(filename), `/api/profile-images/${filename}`);
  assert.equal(getProfileImageSrc("../avatar.jpg"), null);
});
