import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { defaultLocale, isLocale, locales } from "./config.ts";

function messageKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object") return [prefix];
  return Object.entries(value).flatMap(([key, nestedValue]) =>
    messageKeys(nestedValue, prefix ? `${prefix}.${key}` : key),
  );
}

function messageValues(value: Record<string, unknown>, prefix = ""): Record<string, string> {
  return Object.fromEntries(Object.entries(value).flatMap(([key, item]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof item === "string" ? [[path, item]] : Object.entries(messageValues(item as Record<string, unknown>, path));
  }));
}

test("all locales expose the same message keys", () => {
  const keysByLocale = locales.map((locale) => {
    const messages = JSON.parse(
      readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"),
    );
    return messageKeys(messages).sort();
  });

  for (const keys of keysByLocale.slice(1)) {
    assert.deepEqual(keys, keysByLocale[0]);
  }
});

test("accepts only configured locales", () => {
  assert.equal(defaultLocale, "pl");
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("it"), false);
});

test("cooking questions are translated in every non-English locale", () => {
  const english = JSON.parse(
    readFileSync(new URL("../messages/en.json", import.meta.url), "utf8"),
  ).Cooking.questions as Record<string, string>;

  for (const locale of ["pl", "de", "fr", "es"] as const) {
    const questions = JSON.parse(
      readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"),
    ).Cooking.questions as Record<string, string>;

    for (const [key, value] of Object.entries(questions)) {
      assert.notEqual(value, english[key], `${locale}: Cooking.questions.${key}`);
    }
  }
});

test("recipe cards and shopping input do not use English fallbacks", () => {
  const english = JSON.parse(
    readFileSync(new URL("../messages/en.json", import.meta.url), "utf8"),
  );
  const paths = [
    ["ShoppingList", "placeholder"],
    ["Recipe", "servings"],
    ["Recipe", "difficultyOptions", "easy"],
    ["Recipe", "match"],
    ["Recipe", "missingNames"],
    ["Recipe", "viewRecipe"],
    ["AddMissingItems", "button"],
  ] as const;

  for (const locale of ["de", "fr", "es"] as const) {
    const messages = JSON.parse(
      readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"),
    );
    for (const path of paths) {
      const value = path.reduce<unknown>(
        (current, key) => (current as Record<string, unknown>)[key],
        messages,
      );
      const englishValue = path.reduce<unknown>(
        (current, key) => (current as Record<string, unknown>)[key],
        english,
      );
      assert.notEqual(value, englishValue, `${locale}: ${path.join(".")}`);
    }
  }
});

test("dashboard does not use English fallbacks", () => {
  const english = JSON.parse(
    readFileSync(new URL("../messages/en.json", import.meta.url), "utf8"),
  ).Dashboard as Record<string, string>;

  for (const locale of ["de", "fr", "es"] as const) {
    const dashboard = JSON.parse(
      readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"),
    ).Dashboard as Record<string, string>;

    for (const [key, value] of Object.entries(dashboard)) {
      assert.notEqual(value, english[key], `${locale}: Dashboard.${key}`);
    }
  }
});

test("all translated screens avoid English fallbacks and keep interpolation variables", () => {
  const english = messageValues(JSON.parse(readFileSync(new URL("../messages/en.json", import.meta.url), "utf8")));
  const shared = new Set(["Recipe.minutes", "RecipeForm.link.placeholder", "Receipt.upload.formats",
    ...["instagram", "facebook", "tiktok", "youtube"].map((source) => `RecipeForm.link.sources.${source}`)]);
  const sameByLanguage: Record<string, string[]> = {
    de: ["Settings.preferences.diet.options.vegan", "Theme.system", "Inventory.editDialog.name", "Recipe.diet.options.vegan"],
    fr: ["Settings.preferences.diet.allergiesLabel", "Cooking.options.meals.dessert", "Recipe.cuisine", "Recipe.nutrition.calories", "Recipe.allergens.options.lupin", "RecipeForm.recipeDescription", "RecipeForm.cuisine"],
    es: ["Settings.tabs.general", "Errors.notFound.label"],
  };
  for (const locale of ["pl", "de", "fr", "es"] as const) {
    const translated = messageValues(JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8")));
    for (const [key, value] of Object.entries(translated)) {
      if (locale !== "pl" && !shared.has(key) && !sameByLanguage[locale]?.includes(key)) {
        assert.notEqual(value, english[key], `${locale}: ${key}`);
      }
      const variables = (text: string) => [...text.matchAll(/\{([a-zA-Z][\w]*)(?=,|\})/g)].map((match) => match[1]).sort();
      assert.deepEqual(variables(value), variables(english[key]), `${locale}: ${key} variables`);
    }
  }
});
