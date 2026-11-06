import assert from "node:assert/strict";
import test from "node:test";

import { MAX_RECEIPT_IMAGE_MB, validateReceiptImage } from "./receipt-image.ts";

function image(name: string, bytes: number[], size = bytes.length) {
  const file = new File([new Uint8Array(bytes)], name);
  if (size === bytes.length) return file;
  return new File([new Uint8Array(bytes), new Uint8Array(size - bytes.length)], name);
}

test("accepts supported phone image formats by signature", async () => {
  assert.equal(await validateReceiptImage(image("receipt.jpg", [255, 216, 255, 0])), null);
  assert.equal(await validateReceiptImage(image("receipt.png", [137, 80, 78, 71, 13, 10, 26, 10])), null);
  assert.equal(await validateReceiptImage(image("receipt.webp", [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80])), null);
  assert.equal(await validateReceiptImage(image("receipt.heic", [0, 0, 0, 24, 102, 116, 121, 112, 104, 101, 105, 99])), null);
  assert.equal(await validateReceiptImage(image("receipt.heif", [0, 0, 0, 24, 102, 116, 121, 112, 109, 105, 102, 49, 0, 0, 0, 0, 104, 101, 105, 99])), null);
});

test("rejects empty, oversized, renamed and unsupported files", async () => {
  assert.equal(await validateReceiptImage(image("empty.jpg", [])), "emptyFile");
  assert.equal(await validateReceiptImage(image("huge.jpg", [255, 216, 255], MAX_RECEIPT_IMAGE_MB * 1024 * 1024 + 1)), "fileTooLarge");
  assert.equal(await validateReceiptImage(image("renamed.jpg", [37, 80, 68, 70])), "invalidFile");
  assert.equal(await validateReceiptImage(image("short.png", [137])), "invalidFile");
  assert.equal(await validateReceiptImage(image("document.pdf", [37, 80, 68, 70])), "invalidFile");
});
