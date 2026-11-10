import assert from "node:assert/strict";
import test from "node:test";

import { demoRecipes } from "./demo-recipes.ts";
import { localizeAmount, localizeDemoRecipe, localizeUnit } from "./demo-localization.ts";

test("all static recipe titles, ingredients and steps are localized", () => {
  for (const recipe of demoRecipes) {
    for (const locale of ["en", "de", "fr", "es"] as const) {
      const localized = localizeDemoRecipe(recipe, locale);
      assert.notEqual(localized.title, recipe.title);
      assert.equal(localized.steps.length, recipe.steps.length);
      for (const [index, step] of localized.steps.entries()) assert.notEqual(step, recipe.steps[index]);
      assert.equal(localized.ingredients.length, recipe.ingredients.length);
      assert.ok(localized.ingredients.some((ingredient, index) => ingredient.name !== recipe.ingredients[index].name));
    }
  }
});

test("sample custom recipe copy is localized without changing its stored values", () => {
  const sample = { ...demoRecipes[0], slug: "demo-sample", title: "Placki ziemniaczane", isDemo: true,
    description: "Klasyczne chrupiące placki ziemniaczane.",
    steps: ["Zetrzyj ziemniaki i odciśnij nadmiar wody.", "Wymieszaj z jajkiem i dopraw.", "Smaż małe placki na rozgrzanym oleju z obu stron."],
    ingredients: [
      { name: "Ziemniaki", amount: "600 g", available: true },
      { name: "Jajka", amount: "1 szt.", available: true },
      { name: "Olej", amount: "30 ml", available: false },
    ] };
  const german = localizeDemoRecipe(sample, "de");
  assert.equal(german.title, "Kartoffelpuffer");
  assert.equal(german.ingredients[0].name, "Kartoffeln");
  assert.notEqual(german.steps[0], sample.steps[0]);
  assert.equal(sample.title, "Placki ziemniaczane");
  const edited = { ...sample, steps: [...sample.steps.slice(0, 2), "Mój sposób smażenia."] };
  assert.deepEqual(localizeDemoRecipe(edited, "de").steps, edited.steps);
});

test("starter dessert is localized without translating edited recipes", () => {
  const dessert = { ...demoRecipes[0], slug: "starter-dessert", title: "Pieczone jabłka z cynamonem", isDemo: true,
    description: "Ciepły deser z trzech prostych składników.",
    steps: ["Rozgrzej piekarnik do 180°C i wydrąż gniazda nasienne jabłek.", "Wymieszaj miód z cynamonem i napełnij jabłka.", "Piecz około 20 minut, aż jabłka zmiękną."],
    ingredients: [
      { name: "Jabłka", amount: "2 szt.", available: false },
      { name: "Miód", amount: "20 g", available: false },
      { name: "Cynamon", amount: "2 g", available: false },
    ] };
  for (const locale of ["en", "de", "fr", "es"] as const) {
    const localized = localizeDemoRecipe(dessert, locale);
    assert.notEqual(localized.title, dessert.title);
    assert.notEqual(localized.steps[0], dessert.steps[0]);
    assert.notEqual(localized.ingredients[0].name, dessert.ingredients[0].name);
  }
  const edited = { ...dessert, steps: ["Mój własny sposób.", ...dessert.steps.slice(1)] };
  assert.deepEqual(localizeDemoRecipe(edited, "en").steps, edited.steps);
});

test("units are localized for display without changing quantities", () => {
  assert.equal(localizeAmount("2 szt.", "en"), "2 pcs");
  assert.equal(localizeAmount("1 puszka", "fr"), "1 boîte");
  assert.equal(localizeUnit("opak.", 2, "de"), "Packungen");
  assert.equal(localizeUnit("kg", 1, "es"), "kg");
  assert.equal(localizeAmount("4 kromki", "pl"), "4 kromki");
});
