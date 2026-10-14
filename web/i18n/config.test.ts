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
