import assert from "node:assert/strict";
import test from "node:test";

import { extractPublicDescription, extractRecipeDraft, fetchPublicDescription, parseImportUrl } from "./recipe-import.ts";

test("import accepts only fixed HTTPS social hosts", () => {
  assert.ok(parseImportUrl("https://www.instagram.com/reel/DfXapsTRGKU/"));
  assert.equal(parseImportUrl("http://www.instagram.com/reel/id"), null);
  assert.equal(parseImportUrl("https://instagram.com.evil.test/reel/id"), null);
  assert.equal(parseImportUrl("https://127.0.0.1/private"), null);
  assert.equal(parseImportUrl("https://user:pass@instagram.com/reel/id"), null);
});

test("import extracts and decodes the longest public description", () => {
  const html = '<meta name="description" content="Short"><meta content="180 g ciastek &amp; 70 g masła&#10;Wymieszaj i schłódź." property="og:description">';
  assert.equal(extractPublicDescription(html), "180 g ciastek & 70 g masła\nWymieszaj i schłódź.");
});

test("import refuses redirects and reads a public HTML description", async () => {
  const url = parseImportUrl("https://www.instagram.com/reel/id/")!;
  const redirected = await fetchPublicDescription(url, async (_input, init) => {
    assert.equal(init?.redirect, "manual");
    return new Response(null, { status: 302, headers: { Location: "http://127.0.0.1/private" } });
  });
  assert.equal(redirected, null);
  const description = await fetchPublicDescription(url, async () => new Response(
    '<meta property="og:description" content="Ingredients: 180 g biscuits, 70 g butter. Mix and chill.">',
    { headers: { "content-type": "text/html" } },
  ));
  assert.equal(description, "Ingredients: 180 g biscuits, 70 g butter. Mix and chill.");
});

test("short captions do not become invented recipes", async () => {
  const result = await extractRecipeDraft("key", "Oreo dessert in ten minutes", "en", async () => {
    throw new Error("model must not be called");
  });
  assert.deepEqual(result, { error: "noRecipe" });
});

test("complete captions yield an editable draft with unknown servings", async () => {
  const caption = "Ingredients: 180 g biscuits, 70 g melted butter, 600 g cream cheese, 200 g cream. Mix biscuits with butter. Whip cream and fold into cheese. Chill for six hours.";
  const result = await extractRecipeDraft("key", caption, "en", async () => new Response(JSON.stringify({
    status: "completed",
    output: [{ content: [{ type: "output_text", text: JSON.stringify({
      hasRecipe: true, title: "Cheesecake", description: "A chilled cheesecake.", cuisine: "Inna", time: null, servings: null,
      ingredients: [{ name: "Biscuits", amount: "180 g" }, { name: "Butter", amount: "70 g" }],
      steps: ["Mix biscuits and butter.", "Chill."],
    }) }] }],
  }), { headers: { "content-type": "application/json" } }));
  assert.ok("draft" in result);
  if ("draft" in result) assert.equal(result.draft.servings, null);
});
