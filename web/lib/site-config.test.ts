import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { getSiteConfig } from "./site-config.ts";

test("the documented environment example contains valid public business details", () => {
  const config = getSiteConfig(
    parseEnv(readFileSync(new URL("../.env.example", import.meta.url), "utf8")),
  );
  assert.equal(config.contactEmail, "kontakt@example.com");
  assert.ok(config.entityName);
  assert.ok(config.address);
});

test("public legal and contact details come from one environment configuration", () => {
  const config = getSiteConfig({
    LEGAL_ENTITY_NAME: " Firma Testowa ",
    LEGAL_ENTITY_ADDRESS: " Warszawa ",
    CONTACT_EMAIL: " kontakt@example.com ",
    CONTACT_PHONE: "+48 123 456 789",
    LEGAL_TAX_ID: "1234567890",
    LEGAL_REGISTER_ID: "KRS 1234567890",
    LEGAL_UPDATED_AT: "2026-11-20",
    LEGAL_PROCESSORS: "Supabase, OpenAI",
    SECRET_KEY: "must not be exposed",
  });
  assert.equal(config.entityName, "Firma Testowa");
  assert.equal(config.address, "Warszawa");
  assert.equal(config.contactEmail, "kontakt@example.com");
  assert.equal(config.taxId, "1234567890");
  assert.equal(config.processors, "Supabase, OpenAI");
  assert.equal("SECRET_KEY" in config, false);
});

test("redeploying with a different email does not require changing source code", () => {
  assert.equal(
    getSiteConfig({ CONTACT_EMAIL: "first@example.com" }).contactEmail,
    "first@example.com",
  );
  assert.equal(
    getSiteConfig({ CONTACT_EMAIL: "second@example.com" }).contactEmail,
    "second@example.com",
  );
  assert.equal(getSiteConfig({}).contactEmail, "");
});

test("public configuration rejects malformed email and document dates", () => {
  assert.throws(() => getSiteConfig({ CONTACT_EMAIL: "invalid" }));
  assert.throws(() =>
    getSiteConfig({
      CONTACT_EMAIL: "user@example.com\r\nBcc: other@example.com",
    }),
  );
  assert.throws(() => getSiteConfig({ LEGAL_UPDATED_AT: "yesterday" }));
});
