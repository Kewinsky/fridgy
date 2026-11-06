import assert from "node:assert/strict";
import test from "node:test";

import { getRecipeImageSrc, isRecipeImageFilename, MAX_RECIPE_IMAGE_MB, validateRecipeImage } from "./recipe-image.ts";

const jpeg = [255, 216, 255, 0];

function image(name: string, bytes: number[], type: string) {
  return new File([new Uint8Array(bytes)], name, { type });
}

test("accepts supported recipe images and rejects renamed files", async () => {
  assert.equal(await validateRecipeImage(image("dinner.jpg", jpeg, "image/jpeg")), null);
  assert.equal(await validateRecipeImage(image("dinner.png", [137, 80, 78, 71, 13, 10, 26, 10], "image/png")), null);
  assert.equal(await validateRecipeImage(image("dinner.webp", [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80], "image/webp")), null);
  assert.equal(await validateRecipeImage(image("dinner.jpg", [37, 80, 68, 70], "image/jpeg")), "invalid");
  assert.equal(await validateRecipeImage(image("dinner.jpg", jpeg, "image/png")), "invalid");
  assert.equal(await validateRecipeImage(image("dinner.heic", jpeg, "image/heic")), "invalid");
  assert.equal(await validateRecipeImage(image("empty.jpg", [], "image/jpeg")), "invalid");
});

test("rejects images larger than the private bucket limit", async () => {
  const oversized = new File([new Uint8Array(MAX_RECIPE_IMAGE_MB * 1024 * 1024 + 1)], "dinner.jpg", { type: "image/jpeg" });
  assert.equal(await validateRecipeImage(oversized), "tooLarge");
});

test("only routes generated image filenames to the private image endpoint", () => {
  const filename = "12345678-1234-1234-1234-123456789abc.jpg";
  assert.equal(isRecipeImageFilename(filename), true);
  assert.equal(isRecipeImageFilename("../other.jpg"), false);
  assert.equal(isRecipeImageFilename("12345678-1234-1234-1234-123456789abc.svg"), false);
  assert.equal(getRecipeImageSrc({ imagePath: filename }), `/api/recipe-images/${filename}`);
  assert.equal(getRecipeImageSrc({ image: "/recipes/demo.webp", imagePath: filename }), "/recipes/demo.webp");
});
