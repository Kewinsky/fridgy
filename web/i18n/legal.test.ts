import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createTranslator } from "next-intl";
import { locales } from "./config.ts";
import { SUBSCRIPTION_OFFER } from "../lib/subscription.ts";

test("legal documents render all translated sections with dynamic data and links", () => {
  for (const locale of locales) {
    const messages = JSON.parse(
      readFileSync(
        new URL(`../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    );
    const t = createTranslator({
      locale,
      messages,
      onError(error) {
        throw error;
      },
    });
    for (const kind of ["privacy", "terms"]) {
      assert.match(
        t(`Legal.${kind}.providerDescription`, { name: "Test Provider" }),
        /Test Provider/,
      );
      for (const [section, value] of Object.entries(messages.Legal[kind])) {
        if (!value || typeof value !== "object") continue;
        const text = t.rich(`Legal.${kind}.${section}.body`, {
          trialDays: SUBSCRIPTION_OFFER.trialDays,
          processors: "Example Provider",
          contact: (chunks) => chunks,
          pricing: (chunks) => chunks,
          settings: (chunks) => chunks,
          privacy: (chunks) => chunks,
          authority: (chunks) => chunks,
          consumer: (chunks) => chunks,
        });
        assert.equal(typeof text, "string", `${locale}: ${kind}.${section}`);
        assert.doesNotMatch(
          String(text),
          /<\/?(?:contact|pricing|settings|privacy|authority|consumer)>/,
        );
      }
    }
  }
});
