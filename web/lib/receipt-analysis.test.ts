import assert from "node:assert/strict";
import test from "node:test";

import { receiptItemsSchema, requestReceiptItems } from "./receipt-analysis.ts";

const item = {
  name: "Pomidory",
  quantity: 0.62,
  unit: "kg",
  category: "Warzywa",
  storageLocation: "Lodówka",
  estimatedDays: 4,
};

function modelResponse(value: unknown): typeof fetch {
  return async (_url, options) => {
    const body = JSON.parse(String(options?.body));
    assert.equal(body.store, false);
    assert.match(body.input[0].content[1].image_url, /^data:image\/jpeg;base64,\/9j\/AA==$/);
    return Response.json({ status: "completed", output: [{ content: [{ type: "output_text", text: JSON.stringify(value) }] }] });
  };
}

test("extracts validated purchased items from an image response", async () => {
  const result = await requestReceiptItems("test-key", Buffer.from([255, 216, 255, 0]), "image/jpeg", modelResponse({ items: [item] }));
  assert.deepEqual(result, [item]);
});

test("rejects invalid quantities and unknown product data", async () => {
  await assert.rejects(requestReceiptItems("test-key", Buffer.from([255, 216, 255, 0]), "image/jpeg", modelResponse({ items: [{ ...item, quantity: 0 }] })));
  await assert.rejects(requestReceiptItems("test-key", Buffer.from([255, 216, 255, 0]), "image/jpeg", modelResponse({ items: [{ ...item, category: "Nieznana" }] })));
  await assert.rejects(requestReceiptItems("test-key", Buffer.from([255, 216, 255, 0]), "image/jpeg", modelResponse({ items: [{ ...item, estimatedDays: 0 }] })));
});

test("accepts the new grocery categories and a per-product date estimate", () => {
  for (const category of ["Napoje", "Słodycze i przekąski", "Przyprawy i dodatki", "Inne"]) {
    const parsed = receiptItemsSchema.parse({ items: [{ ...item, category, estimatedDays: 30 }] });
    assert.equal(parsed.items[0].category, category);
    assert.equal(parsed.items[0].estimatedDays, 30);
  }
});

test("does not keep a price if an AI response includes one", () => {
  const parsed = receiptItemsSchema.parse({ items: [{ ...item, price: "8,67" }] });
  assert.equal("price" in parsed.items[0], false);
});
